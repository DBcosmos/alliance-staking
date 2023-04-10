import React, { useEffect, useMemo} from 'react'
import {Text, VStack} from '@chakra-ui/react'
import AssetInput from '../../AssetInput'
import {useRecoilState} from "recoil";
import {walletState, WalletStatusType} from "state/atoms/walletAtoms";
import {Controller, useForm} from "react-hook-form";
import {delegationAtom, DelegationState} from "state/atoms/delegationAtoms";
import ValidatorInput from "components/ValidatorInput/ValidatorInput";
import tokenList from "public/mainnet/white_listed_token_info.json";
import useValidators from "hooks/useValidators";
import usePrice from "hooks/usePrice";
import tokens from "public/mainnet/white_listed_token_info.json";

const Redelegate = ({ validatorAddress, delegations}) => {

    const [{status, address}, _] = useRecoilState(walletState)
    const [currentDelegationState, setCurrentDelegationState] = useRecoilState<DelegationState>(delegationAtom)

    const isWalletConnected = status === WalletStatusType.connected

    const {data: {validators = []} = {}} = useValidators({address})

    const chosenValidator = useMemo(()=>
        validators.find(v=>v.operator_address === validatorAddress),
        [validatorAddress])

    const onInputChange = (tokenSymbol: string | null, amount: number) => {

        if (tokenSymbol) {
            setCurrentDelegationState({...currentDelegationState, tokenSymbol: tokenSymbol, amount: Number(amount)})
        } else {
            setCurrentDelegationState({...currentDelegationState, amount: Number(amount)})
        }
    }

    useEffect(() => {
        const token = tokens.find(e=>e.symbol === "ampLUNA")
        const newState: DelegationState = {
            validatorDestAddress: null,
            amount: 0,
            denom: token.denom,
            tokenSymbol: token.symbol,
            validatorSrcAddress: chosenValidator?.operator_address,
            validatorSrcName: chosenValidator?.description.moniker,
            decimals: 6
        }
        setCurrentDelegationState(newState)
    }, [isWalletConnected, chosenValidator])


    const {control} = useForm({
        mode: 'onChange',
        defaultValues: {
            currentDelegationState
        },
    })


    const allSingleTokenDelegations = useMemo(() => {
        return delegations
            .filter((d) => d.token.symbol === currentDelegationState.tokenSymbol)
            .filter(
                (d) =>
                    currentDelegationState.validatorSrcAddress === null ||
                    d.delegation.validator_address ===
                    currentDelegationState.validatorSrcAddress
            );
    }, [delegations, currentDelegationState]);

    const aggregatedAmount = allSingleTokenDelegations?.reduce((acc, e) => (acc + Number(e?.token?.amount ?? 0)), 0).toFixed(6);
    const [priceList] = usePrice() || []

    const price = useMemo(() => {
        if (!tokens || !Array.isArray(tokens) || !priceList) {
            return undefined;
        }
        const token = tokens.find((e) => e.symbol === currentDelegationState.tokenSymbol);

        if (!token) {
            return undefined;
        }
        return priceList[token.name];
    }, [priceList, currentDelegationState.tokenSymbol, tokens]);


    return <VStack
        px={7}
        width="full"
        alignItems="flex-start"
        marginBottom={5}>
        <Text>From</Text>
        <Controller
            name="currentDelegationState"
            control={control}
            rules={{required: true}}
            render={({field}) => (
                <ValidatorInput
                    delegatedOnly={true}
                    validatorName={currentDelegationState.validatorSrcName}
                    onChange={(validator) => {
                        field.onChange(validator)
                        setCurrentDelegationState({
                            ...currentDelegationState,
                            validatorSrcAddress: validator.operator_address,
                            validatorSrcName: validator.description.moniker
                        })
                    }}
                    showList={true}/>)}/>
        <Text pt={5}>To</Text>
        <Controller
            name="currentDelegationState"
            control={control}
            rules={{required: true}}
            render={({field}) => (
                <ValidatorInput
                    delegatedOnly={false}
                    validatorName={currentDelegationState.validatorDestName}
                    onChange={(validator) => {
                        field.onChange(validator)
                        setCurrentDelegationState({
                            ...currentDelegationState,
                            validatorDestAddress: validator.operator_address,
                            validatorDestName: validator.description.moniker
                        })
                    }}
                    showList={true}/>)}/>
        <Text pt={5}>Amount</Text>
        <Controller
            name="currentDelegationState"
            control={control}
            rules={{required: true}}
            render={({field}) => (
                <AssetInput
                    hideToken={currentDelegationState.tokenSymbol}
                    {...field}
                    token={currentDelegationState}
                    whalePrice={price}
                    balance={aggregatedAmount}
                    minMax={false}
                    disabled={false}
                    onChange={(value, isTokenChange) => {
                        onInputChange(value, 0)
                        field.onChange(value)
                        if (isTokenChange) {
                            const denom = tokenList.find(t=>t.symbol === value.tokenSymbol).denom
                            setCurrentDelegationState({
                                ...currentDelegationState,
                                tokenSymbol: value.tokenSymbol,
                                amount: value.amount,
                                denom: denom
                            })
                        } else {
                            setCurrentDelegationState({...currentDelegationState, amount: value.amount})
                        }
                    }}
                />
            )}
        />
    </VStack>

}

export default Redelegate
