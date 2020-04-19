var DeployDFO = React.createClass({
    requiredScripts: [
        'spa/sequentialOps.jsx'
    ],
    render() {
        var _this = this;
        return (
            <span>
                <SequentialOps ref={ref => this.sequentialOps = ref} initialContext={_this.props.allData} auto="true">
                    {[{
                        name: "Deploy Voting Token | " + _this.props.allData.tokenTotalSupply + " " + _this.props.allData.tokenSymbol,
                        call: function (data) {
                            return new Promise(function (ok, ko) {
                                var errors = [];
                                !data.dfoName && errors.push('Insert a valid DFO Name');
                                !data.tokenSymbol && errors.push('Insert a valid Token Symbol');
                                data.tokenDecimals < 1 && errors.push('Token Decimals must be greater than 1');
                                (isNaN(data.tokenTotalSupply) || data.tokenTotalSupply < 1) && errors.push('Token Total Supply must be greater than 1');
                                !data.ensDomain && errors.push('ENS Domain is mandatory');
                                !data.governanceRules && errors.push('You must choose one of te proposed governance rules to continue');
                                (isNaN(data.surveyLength) || data.surveyLength < 1) && errors.push('Survey Length must be greater than or equal to 1');
                                (isNaN(data.emergencySurveyLength) || data.emergencySurveyLength < 1) && errors.push('Emergency Survey Length must be greater than or equal to 1');
                                (isNaN(data.emergencySurveyStaking) || data.emergencySurveyStaking < 0 || data.emergencySurveyStaking > parseInt(_this.props.allData.tokenTotalSupply)) && errors.push('Emergency Survey Penalty must be a number between 0 and ' + _this.props.allData.tokenTotalSupply);
                                data.surveyQuorumCheck && (isNaN(data.surveyQuorum) || data.surveyQuorum < 1 || data.surveyQuorum > parseInt(_this.props.allData.tokenTotalSupply)) && errors.push('Survey quorum must be a number between 1 and ' + _this.props.allData.tokenTotalSupply);
                                data.governanceRules === 'HodlersDriven' && (isNaN(data.surveyMinStake) || data.surveyMinStake < 1 || parseInt(data.surveyMinStake) > parseInt(_this.props.allData.tokenTotalSupply)) && errors.push('Survey minimum stake must be a number between 1 and ' + _this.props.allData.tokenTotalSupply);
                                data.governanceRules === 'CommunityDriven' && (isNaN(data.surveyCommunityStake) || data.surveyCommunityStake < 1 || parseInt(data.surveyCommunityStake) > _this.props.allData.availableSupply) && errors.push('Survey Community reward must be a number between 1 and ' + _this.props.allData.availableSupply);
                                data.governanceRules === 'CommunityDriven' && (isNaN(data.surveySingleReward) || data.surveySingleReward < 1 || parseInt(data.surveySingleReward) > parseInt(_this.props.allData.tokenTotalSupply)) && errors.push('Survey single reward must be a number between 1 and ' + _this.props.allData.tokenTotalSupply);
                                if (errors.length > 0) {
                                    return ko(errors);
                                }
                                return ok();
                            }).then(() => {
                                var payload = window.web3.eth.abi.encodeParameters(['address', 'uint256', 'string', 'string', 'uint256', 'uint256'], [
                                    window.voidEthereumAddress, 0,
                                    data.dfoName,
                                    data.tokenSymbol,
                                    data.tokenTotalSupply,
                                    data.surveyCommunityStake || 0
                                ]);
                                return window.blockchainCall(window.dfoHub.dFO.methods.submit, 'deployVotingToken', payload).then(response => {
                                    response = window.formatDFOLogs(response.events.Event, "DFOCollateralContractsCloned(address_indexed,address,address,address)").raw.data;
                                    data.votingToken = response[0];
                                    data.stateHolder = response[1];
                                    data.functionaltyModelsManagerAddress = response[2];
                                })
                            });
                        }
                    }, {
                        name: "Deploy Proposals Manager",
                        call: function (data) {
                            var payload = window.web3.eth.abi.encodeParameters(['address', 'uint256'], [window.voidEthereumAddress, 0]);
                            return window.blockchainCall(window.dfoHub.dFO.methods.submit, 'deployProposalsManager', payload).then(response => {
                                data.mvdFunctionalityProposalManagerAddress = window.formatDFOLogs(response.events.Event, "DFOCollateralContractsCloned(address_indexed,address)").raw.data[0];
                            });
                        }
                    }, {
                        name: "Deploy " + _this.props.allData.governanceRulesText + " Governance Rules" + (_this.props.allData.governanceRules === 'OpenBasic' ? '' : (' | Staking ' + (_this.props.allData.governanceRules === 'HodlersDriven' ? _this.props.allData.surveyMinStake : _this.props.allData.surveyCommunityStake + ' ' + _this.props.allData.tokenSymbol + ' and releasing ' + _this.props.allData.surveySingleReward) + ' ' + _this.props.allData.tokenSymbol)),
                        call: function (data) {
                            var params = ['address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'uint256'];
                            var values = [window.voidEthereumAddress, 0,
                                data.surveyLength,
                                data.emergencySurveyLength,
                                data.emergencySurveyStaking,
                                data.stateHolder,
                                data.surveyQuorum || 0
                            ];
                            data.governanceRules !== 'OpenBasic' && params.push('uint256') && values.push(data.governanceRules === 'CommunityDriven' ? data.surveySingleReward : data.surveyMinStake);
                            var payload = window.web3.eth.abi.encodeParameters(params, values);
                            return window.blockchainCall(window.dfoHub.dFO.methods.submit, ('deploy' + data.governanceRules + 'GovernanceRules'), payload).then(response => {
                                data.functionaltiesManagerAddress = window.formatDFOLogs(response.events.Event, "DFOCollateralContractsCloned(address_indexed,address)").raw.data[0];
                            })
                        }
                    }, {
                        name: "Deploy New DFO",
                        call: function (data) {
                            var payload = window.web3.eth.abi.encodeParameters(['address', 'uint256', 'address', 'address', 'address', 'address', 'address', 'string'], [
                                window.voidEthereumAddress,
                                0,
                                data.votingToken,
                                data.stateHolder,
                                data.functionaltyModelsManagerAddress,
                                data.mvdFunctionalityProposalManagerAddress,
                                data.functionaltiesManagerAddress,
                                data.ensDomain.toLowerCase()
                            ]);
                            return window.blockchainCall(window.dfoHub.dFO.methods.submit, 'deployDFO', payload).then(response => {
                                data.response = window.formatDFOLogs(response.events.Event, "DFODeployed(address_indexed,address)").raw.data[0];
                            }).then(() => _this.emit("dfo/deploy", window.newContract(window.context.dfoAbi, data.response)));
                        }
                    }]}
                </SequentialOps>
            </span>
        );
    }
});