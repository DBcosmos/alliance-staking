import { TerraStationWallet } from 'util/wallet-adapters/terraStationWallet';
import { MsgClaimDelegationRewards} from '@terra-money/feather.js';

export const claimRewards = async (
    wallet: TerraStationWallet,
    delegations: any,
    address: string,
) => {
    const msgs = delegations.map(({ delegation }) => {
            return new MsgClaimDelegationRewards(
                delegation.delegator_address,
                delegation.validator_address,
                delegation.denom
            )})

    // const feeEstimation = await estimateFee(wallet,address,msgs)
    // const amounts = feeEstimation.amount
    // const gasLimit = feeEstimation.gas_limit
    //

    return await wallet.client.post({ chainID: 'migaloo-1', msgs: msgs });
};