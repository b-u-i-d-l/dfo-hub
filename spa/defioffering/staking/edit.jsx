var StakingEdit = React.createClass({
    getInitialState() {
        var state = {
            tiers: [],
            pairs: []
        };
        this.props && this.props.stakingData && this.props.stakingData.tiers && this.props.stakingData.tiers.forEach(it => state.tiers.push(it));
        this.props && this.props.stakingData && this.props.stakingData.pairs && this.props.stakingData.pairs.forEach(it => state.pairs.push(it));
        return state;
    },
    deleteTier(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var i = parseInt(e.currentTarget.dataset.index);
        var deleted = this.state.tiers[i];
        this.state.tiers.splice(i, 1);
        var _this = this;
        this.setState({ tiers: this.state.tiers, tier : deleted.tierKey, blockNumber : deleted.tierKey === 'Custom' ? deleted.blockNumber : null }, function () {
            _this.customBlockNumber && (_this.customBlockNumber.value = deleted.blockNumber);
            _this.rewardSplitTranchesInput && (_this.rewardSplitTranchesInput.value = deleted.rewardSplitTranche);
            !_this.customBlockNumber && (_this.domRoot.children().find('input[type="radio"][data-value="' + deleted.blockNumber + '"]')[0].checked = true);
            _this.hardCapInput.value = window.fromDecimals(deleted.hardCap, _this.props.element.decimals);
            _this.minCapInput.value = window.fromDecimals(deleted.minCap, _this.props.element.decimals);
            _this.rewardPercentageInput.value = window.formatMoney(deleted.percentage);
        });
    },
    addTier(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.emit('message');
        var hardCap = '0';
        try {
            hardCap = window.toDecimals(this.hardCapInput.value.split(',').join(''), this.props.element.decimals);
        } catch(e) {
        }
        if(isNaN(parseInt(hardCap)) || parseInt(hardCap) <= 0) {
            return this.emit('message', 'Hard Cap must be a valid positive number', 'error');
        }
        var minCap = '0';
        try {
            minCap = window.toDecimals(this.minCapInput.value.split(',').join(''), this.props.element.decimals);
        } catch(e) {
        }
        if(isNaN(parseInt(minCap)) || parseInt(minCap) <= 0) {
            return this.emit('message', 'Min Cap must be a valid positive number', 'error');
        }
        var blockNumber = '0';
        try {
            blockNumber = (this.customBlockNumber ? this.customBlockNumber.value : this.domRoot.children().find('input[type="radio"]:checked')[0].dataset.value).split(',').join('');
        } catch(e) {
        }
        if(isNaN(parseInt(blockNumber)) || parseInt(blockNumber) <= 0) {
            return this.emit('message', 'Block Limit must be a valid positive number', 'error');
        }
        var rewardSplitTranche = 0;
        try {
            rewardSplitTranche = this.rewardSplitTranchesInput ? this.rewardSplitTranchesInput.value : this.props.stakingData.blockTiers[this.state.tier].weeks;
        } catch(e) {
        }
        if(isNaN(parseInt(rewardSplitTranche)) || parseInt(rewardSplitTranche) <= 0) {
            return this.emit('message', 'Split amount must be a valid positive number', 'error');
        }
        var percentage = 0;
        try {
            percentage = parseFloat(this.rewardPercentageInput.value.split(',').join(''));
        } catch(e) {
        }
        if(isNaN(percentage) || percentage < 1 || percentage > 100) {
            return this.emit('message', 'Percentage must be a number between 1 and 100', 'error');
        }
        var tiers = (this.state && this.state.tiers) || [];
        tiers.push({
            hardCap,
            minCap,
            blockNumber,
            percentage,
            time: window.calculateTimeTier(blockNumber),
            tierKey: window.getTierKey(blockNumber)
        });
        var _this = this;
        this.setState({tiers, blockNumber: null, tier : null}, function () {
            _this.customBlockNumber && (_this.customBlockNumber.value = '');
            _this.rewardSplitTranchesInput && (_this.rewardSplitTranchesInput.value = '');
            _this.hardCapInput.value = '';
            _this.minCapInput.value = '';
            _this.rewardPercentageInput.value = '';
        });
    },
    onTierChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.setState({ blockNumber: null, tier: e.currentTarget.value });
    },
    onBlockLimitChange(e) {
        this.setState({ blockNumber: parseInt(e.currentTarget.dataset.value) });
    },
    onNewPair(newPair) {
        this.pairPicker.setState({ selected: null });
        var pairs = (this.state && this.state.pairs) || [];
        for (var pair of pairs) {
            if (pair.address === newPair.address) {
                return;
            }
        }
        pairs.push(newPair);
        this.setState({ pairs });
    },
    deletePair(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.state.pairs.splice(parseInt(e.currentTarget.dataset.index), 1);
        this.setState({ pairs: this.state.pairs });
    },
    proposeNewStaking(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.emit('message');
        var startBlock = parseInt(this.startBlockInput.value);
        if(isNaN(startBlock) || startBlock < 0) {
            return this.emit('message', 'Start Block must be a number greater than 0', 'error');
        }
        var pairs = (this.state && this.state.pairs || []);
        if(pairs.length === 0) {
            return this.emit('message', 'Please select at least a pair', 'error');
        }
        var tiers = (this.state && this.state.tiers || []);
        if(tiers.length === 0) {
            return this.emit('message', 'You must add at least a tier', 'error');
        }
        for(var tier of tiers) {
            tier.timeWindow = tier.blockNumber;
            var percentage = window.calculateMultiplierAndDivider(tier.percentage);
            tier.rewardMultiplier = percentage[0];
            tier.rewardDivider = percentage[1];
        }
        window.stake(this, startBlock, pairs.map(it => it.address), tiers);
    },
    render() {
        var _this = this;
        return (<section className="BravPicciot">
            <section>
                <section className="DFOTitleSection">
                    <h5 className="DFOHostingTitle"><b>Start Block:</b></h5>
                    <input type="number" ref={ref => this.startBlockInput = ref} min="0"/>
                </section>
            </section>
            <section>
                <section className="DFOTitleSection">
                    <h5 className="DFOHostingTitle"><b>Pairs:</b></h5>
                    <TokenPicker ref={ref => this.pairPicker = ref} tokenAddress={this.props.element.token.options.address} onChange={this.onNewPair} />
                    {this.state.pairs.map((it, i) => <a key={it.address} href="javascript:;" className="DFOHostingTag">
                        <img src={it.logo}></img>
                        {it.symbol}
                        <a href="javascript:;" data-index={i} onClick={_this.deletePair}><h2>X</h2></a>
                    </a>)}
                </section>
            </section>
            <section>
                <section className="DFOTitleSection">
                    <h5 className="DFOHostingTitle"><b>Tiers:</b></h5>
                    <section>
                        <p>Block Limit</p>
                        <select onChange={this.onTierChange}>
                            {Object.keys(_this.props.stakingData.blockTiers).map(it => <option key={it} value={it} selected={_this.state.tier === it}>{it}</option>)}
                            <option value="Custom" selected={_this.state.tier === 'Custom'}>Custom</option>
                        </select>
                        {(this.state && this.state.tier && this.state.tier !== 'Custom') && <p>{_this.props.stakingData.blockTiers[this.state.tier].weeks} Weeks</p>}
                        {(!this.state || this.state.tier !== 'Custom') && <ul>
                            {_this.props.stakingData.blockTiers[(this.state && this.state.tier) || Object.keys(_this.props.stakingData.blockTiers)[0]].averages.map(it => <li key={it}>
                                <label>
                                    {it}
                                    {'\u00a0'}
                                    <input type="radio" data-value={it} name="blockNumber" onChange={this.onBlockLimitChange} ref={ref => ref && (ref.checked = this.state.blockNumber === it)} />
                                </label>
                            </li>)}
                        </ul>}
                        {this.state && this.state.tier === 'Custom' && <section>
                            <label>
                                <p>Value:</p>
                                <input type="number" min="1" placeholder="Custom block number..." ref={ref => this.customBlockNumber = ref} />
                            </label>
                            <label>
                                <p>Tranches amount:</p>
                                <input type="number" min="1" ref={ref => this.rewardSplitTranchesInput = ref}/>
                            </label>
                        </section>}
                    </section>
                    <label>
                        <p>Hard Cap:</p>
                        <input ref={ref => this.hardCapInput = ref} type="text" placeholder="Ammount" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" onChange={this.onHardCapChange} />
                    </label>
                    <label>
                        <p>Min Cap:</p>
                        <input ref={ref => this.minCapInput = ref} type="text" placeholder="Ammount" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" disabled />
                    </label>
                    <label>
                        <p>Reward Percentage:</p>
                        <span><input ref={ref => this.rewardPercentageInput = ref} type="number" min="0" max="100" placeHoder="Insert a percentage"/> {'\u00a0'} %</span>
                    </label>
                    <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB LinkVisualButtonBIGGA" onClick={this.addTier}>Add</a>
                    {this.state && this.state.tiers && <ul>
                        {this.state.tiers.map((it, i) => <li key={it.blockNumber} className="TheDappInfoAll TheDappInfoSub">
                            <section className="TheDappInfo1">
                                <section className="DFOTitleSection">
                                    <h5 className="DFOHostingTitle"><img src={_this.props.element.logo}></img><b>{_this.props.element.symbol}</b> for {it.time}</h5>
                                    <h5 className="DFOHostingTitle">Reward: <b className='DFOHostingTitleG'>{window.formatMoney(it.percentage)}%</b></h5>
                                    <p className="DFOHostingTitle">Distribution: <b>Weekly</b></p>
                                    <p className="DFOLabelTitleInfosmall">DEX: &#129412; V2 </p>
                                </section>
                            </section>
                            {_this.state && _this.state.pairs && <section className="TheDappInfo1">
                                <section className="DFOTitleSection">
                                    <h5 className="DFOHostingTitle"><b>Pairs:</b></h5>
                                    {_this.state.pairs.map(pair => <a key={pair.address} href={window.getNetworkElement('etherscanURL') + 'token/' + pair.address} target="_blank" className="DFOHostingTag">
                                        <img src={pair.logo}></img>
                                        {pair.symbol}
                                    </a>)}
                                </section>
                            </section>}
                            <section className="TheDappInfo1">
                                <section className="DFOTitleSection">
                                    <span className="DFOHostingTitleS">Min Cap:</span>
                                    <h5 className="DFOHostingTitle"><b>{window.fromDecimals(it.minCap, _this.props.element.decimals)}</b></h5>
                                    <span className="DFOHostingTitleS DFOHostingTitleG">Hard Cap:</span>
                                    <h5 className="DFOHostingTitle DFOHostingTitleG"><b>{window.fromDecimals(it.hardCap, _this.props.element.decimals)}</b></h5>
                                </section>
                            </section>
                            <a href="javascript:;" data-index={i} onClick={_this.deleteTier}><h2>X</h2></a>
                        </li>)}
                    </ul>}
                </section>
            </section>
            <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB LinkVisualButtonBIGGA" onClick={this.proposeNewStaking}>Propose new Liquidity Staking Proposals</a>
        </section>);
    }
});