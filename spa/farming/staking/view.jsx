var StakingView = React.createClass({
    requiredScripts: [
        'spa/loaderMinimino.jsx',
        'spa/farming/staking/edit.jsx',
        'spa/farming/staking/edit_old.jsx',
        'spa/imported/farm/ExploreFarmingContract.jsx',
        'spa/imported/farm/FarmingComponent.jsx',
        'spa/imported/farm/SetupComponent.jsx',
        'spa/imported/shared/Input.jsx',
        'spa/imported/shared/Coin.jsx',
        'spa/imported/shared/TokenInput.jsx',
        'spa/imported/shared/ApproveButton.jsx',
        'spa/imported/farm/CreateOrEditFarmingSetup.jsx',
        'spa/imported/farm/CreateOrEditFarmingSetups.jsx'
    ],
    requiredModules: [
        'spa/stake',
        'spa/stake_old'
    ],
    getDefaultSubscriptions() {
        return {
            'stake/close': () => this.setState({ stakeToShow: null })
        };
    },
    cancelEdit() {
        this.setState({edit : false, farmingContract : null, cancelEdit : null});
    },
    showStake(e, stakeToShow) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.setState({ stakeToShow });
    },
    stopStake(e, element) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        window.stopStake(this, element.stakingManager.options.address);
    },
    componentDidMount() {
        var _this = this;
        var call = !_this.props.element.logo;
        _this.props.element.logo = _this.props.element.logo || _this.props.element.logoUri || _this.props.element.logoURI;
        _this.props.element.logo && call && _this.forceUpdate();
        !_this.props.element.logo && window.loadLogo(_this.props.element.token.options.address).then(logo => {
            _this.props.element.logo = logo;
            _this.forceUpdate();
        });
    },
    renderFarmData(element) {
        var props = {...this.getProps(), farmAddress : element.contract.options.address};
        element.readonly && delete props.edit;
        return React.createElement(ExploreFarmingContract, props);
    },
    renderStakingData(element) {
        if (!element.old) {
            return this.renderFarmData(element);
        }
        var _this = this;
        var lis = [];
        lis.push(...element.tiers.map(it => <li key={it.blockNumber} className="TheDappInfoAll TheDappInfoSub KingJulianAlwaysWatchingYou">
            <section className="TheDappInfo1 TheDappInfoYY">
                <section className="DFOTitleSection">
                    <h5 className="DFOHostingTitle DFOHostingTitleTTT">Earn <img src={window.formatLink(element.rewardToken.logoUri || element.rewardToken.logoURI || element.rewardToken.logo)}></img><b>{element.rewardToken.symbol}</b></h5>
                    <p className="DFOHostingTitle DFOHostingTitleTTT"> by lock liquidity with:</p>
                    <a className="DFOHostingTag DFOHostingTag4">
                        <img src={window.formatLink((element.mainToken || it.mainToken).logoUri || (element.mainToken || it.mainToken).logoURI || (element.mainToken || it.mainToken).logo)} />
                        {(element.mainToken || it.mainToken).symbol}
                    </a>
                    <p className="DFOHostingTitle DFOHostingTitleTTT">and:</p>
                    {element.pairs.map(pair => <a key={pair.address} href={window.getNetworkElement('etherscanURL') + 'token/' + pair.address} target="_blank" className="DFOHostingTag DFOHostingTag4">
                        <img src={window.formatLink(pair.logo)} />
                        {pair.symbol}
                    </a>)}
                    <p>Via Uniswap V2</p>
                </section>
            </section>
            <section className="TheDappInfo1 TheDappInfoYY">
                <section className="DFOTitleSection">
                    <h5 className="DFOHostingTitle DFOHostingTitleTTT">Total Reward: <b className='DFOHostingTitleG'>{window.formatMoney(it.percentage)}%</b></h5>
                    <p className="DFOHostingTitle DFOHostingTitleTTT TheDappInfoX">Reward Distribution: <b>Weekly</b></p>
                    <h5 className="DFOHostingTitle DFOHostingTitleTTT">Lock time: <b>~{it.tierKey}</b><span>{it.blockNumber} Blocks</span></h5>
                    {element.active && element.running && <p className="DFOHostingTitle DFOHostingTitleTTT TheDappInfoX">You can open Liquidity Mining positions{element.endBlock && <span> until the block n. <b><a target="_blank" href={window.getNetworkElement("etherscanURL") + "block/" + element.endBlock}>{element.endBlock}</a></b></span>}</p>}
                    {element.active && element.terminated && <p className="DFOHostingTitle DFOHostingTitleTTT TheDappInfoX">Liquidity Mining Contract closed until the block <b><a target="_blank" href={window.getNetworkElement("etherscanURL") + "block/" + element.endBlock}>{element.endBlock}</a></b>, you can only redeem for opened positions.</p>}
                    {element.active && !element.started && <p className="DFOHostingTitle DFOHostingTitleTTT TheDappInfoX">This Liquidity Mining will start at the block n. <b><a target="_blank" href={window.getNetworkElement("etherscanURL") + "block/" + element.startBlock}>{element.startBlock}</a></b>.</p>}
                </section>
            </section>
            <section className="TheDappInfo1 TheDappInfoYY">
                <section className="DFOTitleSection">
                    <span className="DFOHostingTitleS">Staked:</span>
                    <h5 className="DFOHostingTitle DFOHostingTitleTTT"><b>{window.fromDecimals(it.staked, _this.props.element.decimals)}</b></h5>
                    <span className="DFOHostingTitleS DFOHostingTitleG">Available:</span>
                    <h5 className="DFOHostingTitle DFOHostingTitleTTT DFOHostingTitleG"><b>{window.fromDecimals(it.remainingToStake, _this.props.element.decimals)}</b></h5>
                    <a href="javascript:;" onClick={e => this.showStake(e, element)} className="LinkVisualButton LinkVisualPropose LinkVisualButtonG">&#129385; {element.active ? "Stake" : "Redeem"}</a>
                    {this.props && this.props.edit && element.active && <a href="javascript:;" onClick={e => this.stopStake(e, element)} className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Stop</a>}
                </section>
            </section>
        </li>));
        return lis;
    },
    getProps() {
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        delete props.props;
        return props;
    },
    render() {
        var _this = this;
        var props = this.getProps();
        if (props.stakeToShow) {
            return React.createElement(props.stakeToShow.old ? StakeOld : Stake, {
                element: props.element,
                stakingData: props.stakeToShow
            });
        }
        var oldStakingData = (!this.state || !this.state.edit) && this.props && this.props.oldStakingData && this.props.oldStakingData;
        var newOldStakingData = oldStakingData && oldStakingData.filter(it => !it.old);
        newOldStakingData && newOldStakingData.forEach(it => it.readonly = true);
        oldStakingData = oldStakingData && oldStakingData.filter(it => it.old);
        return (<ul className="DFOHosting HostingCategoryTitleYYY">
            <section className="HostingCategoryTitle">
                <h2>Active Farming Contracts</h2>
                {this.props.edit && <a href="javascript:;" onClick={() => _this.setState({ edit: !(_this.state && _this.state.edit) , farmingContract : null})} className={"LinkVisualButton LinkVisualPropose LinkVisualButtonB" + (_this.state && _this.state.edit ? 'EditDFOYo Editing' : '')}>{_this.state && _this.state.edit ? 'Close' : 'New'}</a>}
            </section>
            {this.props && this.props.edit && this.state && this.state.edit && props.stakingData && props.stakingData.old && React.createElement(StakingEditOld, props)}
            {this.props && this.props.edit && this.state && this.state.edit && props.stakingData && !props.stakingData.old && React.createElement(StakingEdit, props)}
            {(!this.state || !this.state.edit) && (!this.props || !this.props.stakingData) && <LoaderMinimino />}
            {(!this.state || !this.state.edit) && this.props && this.props.stakingData && this.props.stakingData.length === 0 && <h4>No Farming Contracts <a href="javascript:;" onClick={() => _this.emit('edit/toggle', true, () => _this.setState({ edit: true }))} className="LinkVisualButton LinkVisualPropose LinkVisualButtonB">Create</a></h4>}
            {(!this.state || !this.state.edit) && this.props && this.props.stakingData && this.props.stakingData.length > 0 && <section className="DappBox">
                {this.props.stakingData.map(this.renderStakingData)}
            </section>}
            {(!this.state || !this.state.edit) && <section className="HostingCategoryTitle">
                <h2>Farming Contracts History</h2>
                {(!this.state || !this.state.edit) && this.props && !this.props.oldStakingData && !this.props.loadingOldStakingData && <a href="javascript:;" className="LinkVisualButton LinkVisualPropose LinkVisualButtonB" onClick={() => this.emit('staking/old')}>Redeem and manage positions from old LM contracts</a>}
            </section>}
            {(!this.state || !this.state.edit) && this.props && this.props.loadingOldStakingData && <LoaderMinimino />}
            {(!this.state || !this.state.edit) && this.props && this.props.oldStakingData && this.props.oldStakingData.length === 0 && <h4>No data</h4>}
            {newOldStakingData && newOldStakingData.length > 0 && <section className="DappBox">
                {newOldStakingData.map(this.renderFarmData)}
            </section>}
            {oldStakingData && oldStakingData.map(this.renderStakingData)}
        </ul>);
    }
});