import {
  Alert,
  Box,
  Flex,
  Text,
  Heading,
  Skeleton,
  Accordion,
  chakra,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';
import useApiQuery from 'lib/api/useApiQuery';
import dayjs from 'lib/date/dayjs';
import { currencyUnits } from 'lib/units';
import { HOMEPAGE_STATS } from 'stubs/stats';
import GasTrackerChart from 'ui/gasTracker/GasTrackerChart';
import GasTrackerNetworkUtilization from 'ui/gasTracker/GasTrackerNetworkUtilization';
import GasTrackerPrices from 'ui/gasTracker/GasTrackerPrices';
import GasInfoUpdateTimer from 'ui/shared/gas/GasInfoUpdateTimer';
import NativeTokenIcon from 'ui/shared/NativeTokenIcon';
import PageTitle from 'ui/shared/Page/PageTitle';

const GasTracker = () => {
  const { data, isPlaceholderData, isError, error, dataUpdatedAt } = useApiQuery('stats', {
    queryOptions: {
      placeholderData: HOMEPAGE_STATS,
      refetchOnMount: false,
    },
  });

  if (isError) {
    throw new Error(undefined, { cause: error });
  }

  const isLoading = isPlaceholderData;

  const titleSecondRow = (
    <Flex
      alignItems={{ base: 'flex-start', lg: 'center' }}
      fontFamily="heading"
      fontSize="lg"
      fontWeight={ 500 }
      w="100%"
      columnGap={ 3 }
      rowGap={ 1 }
      flexDir={{ base: 'column', lg: 'row' }}
    >
      { typeof data?.network_utilization_percentage === 'number' &&
        <GasTrackerNetworkUtilization percentage={ data.network_utilization_percentage } isLoading={ isLoading }/> }
      { data?.gas_price_updated_at && (
        <Skeleton isLoaded={ !isLoading } whiteSpace="pre" display="flex" alignItems="center">
          <span>Last updated </span>
          <chakra.span color="text_secondary">{ dayjs(data.gas_price_updated_at).format('DD MMM, HH:mm:ss') }</chakra.span>
          { data.gas_prices_update_in !== 0 && (
            <GasInfoUpdateTimer
              key={ dataUpdatedAt }
              startTime={ dataUpdatedAt }
              duration={ data.gas_prices_update_in }
              size={ 5 }
              ml={ 2 }
            />
          ) }
        </Skeleton>
      ) }
      { data?.coin_price && (
        <Skeleton isLoaded={ !isLoading } ml={{ base: 0, lg: 'auto' }} whiteSpace="pre" display="flex" alignItems="center">
          <NativeTokenIcon mr={ 2 } boxSize={ 6 }/>
          <chakra.span color="text_secondary">{ config.chain.currency.symbol }</chakra.span>
          <span> ${ Number(data.coin_price).toLocaleString(undefined, { maximumFractionDigits: 2 }) }</span>
        </Skeleton>
      ) }
    </Flex>
  );

  const snippets = (() => {
    if (!isPlaceholderData && data?.gas_prices?.slow === null && data?.gas_prices.average === null && data.gas_prices.fast === null) {
      return <Alert status="warning">No recent data available</Alert>;
    }

    return data?.gas_prices ? <GasTrackerPrices prices={ data.gas_prices } isLoading={ isLoading }/> : null;
  })();

  const faq = config.meta.seo.enhancedDataEnabled ? (
    <Box mt={ 12 }>
      <Heading as="h2" mb={ 4 } fontSize="2xl" fontWeight="medium">FAQ</Heading>
      <Accordion>
        <AccordionItem>
          <h3>
            <AccordionButton>
              <Text flex="1" textAlign="left">What does gas refer to on the blockchain?</Text>
              <AccordionIcon/>
            </AccordionButton>
          </h3>
          <AccordionPanel>
            <Text>Gas is the amount of native tokens required to perform a transaction on the blockchain.</Text>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h3>
            <AccordionButton>
              <Text flex="1" textAlign="left">How can I check { config.chain.name } gas fees?</Text>
              <AccordionIcon/>
            </AccordionButton>
          </h3>
          <AccordionPanel>
            { /* eslint-disable-next-line max-len */ }
            <Text>You can easily check live { config.chain.name } gas fees on Blockscout by visiting our gas tracker. It displays current gas fees in { currencyUnits.gwei } for all { config.chain.name } transactions.</Text>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h3>
            <AccordionButton>
              <Text flex="1" textAlign="left">What is the average gas fee for { config.chain.name } transactions?</Text>
              <AccordionIcon/>
            </AccordionButton>
          </h3>
          <AccordionPanel>
            { /* eslint-disable-next-line max-len */ }
            <Text>The average gas fee for { config.chain.name } transactions depends on network congestion and transaction complexity. Blockscout provides real-time gas fee estimations to help users make informed decisions.</Text>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h3>
            <AccordionButton>
              <Text flex="1" textAlign="left">How does Blockscout calculate gas fees?</Text>
              <AccordionIcon/>
            </AccordionButton>
          </h3>
          <AccordionPanel>
            <Text>Blockscout calculates gas fees based on the average price of gas fees spent for the last 200 blocks.</Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  ) : null;

  return (
    <>
      <PageTitle
        title={ config.meta.seo.enhancedDataEnabled ? `${ config.chain.name } gas tracker` : 'Gas tracker' }
        secondRow={ titleSecondRow }
        withTextAd
      />
      <Heading as="h2" mt={ 8 } mb={ 4 } fontSize="2xl">{ `Track ${ config.chain.name } gas fees` }</Heading>
      { snippets }
      { config.features.stats.isEnabled && (
        <Box mt={ 12 }>
          <GasTrackerChart/>
        </Box>
      ) }
      { faq }
    </>
  );
};

export default GasTracker;
