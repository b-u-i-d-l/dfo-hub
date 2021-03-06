ImportReact({
    name : 'StakingEdit',
    requiredScripts : [
        'spa/imported/shared/Input.jsx',
        'spa/imported/shared/Coin.jsx',
        'spa/imported/shared/TokenInput.jsx',
        'spa/imported/farm/Create.jsx'
    ],
    getInitialState() {
        var _this = this;
        return {
            farmingContract : _this.props.farmingContract,
            farmingSetups : _this.props.farmingSetups,
            creationStep : _this.props.creationStep,
            setFarmingContractStep(creationStep) {
                _this.setState({creationStep});
            },
            updateFarmingContract(farmingContract) {
                _this.setState({farmingContract});
            },
            addFarmingSetup(farmingSetup) {
                var farmingSetups = _this.state.farmingSetups.map(it => it);
                farmingSetups.push(farmingSetup);
                _this.setState({farmingSetups});
            },
            removeFarmingSetup(index) {
                var farmingSetups = _this.state.farmingSetups.map(it => it);
                farmingSetups.splice(index, 1);
                _this.setState({farmingSetups});
            },
            dfoCore : {
                async loadDeployedFarmingContracts() {
                    return [];
                }
            }
        }
    },
    className : 'DappBox',
    render : 'Create'
});