import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import Root from './navigators/root';
import { Provider } from 'react-native-paper';
import { MenuProvider } from 'react-native-popup-menu';

import {
  ApolloProvider,
} from "@apollo/client";
import client from './apollo'


export default function App() {
  return (
    <ApolloProvider client={client}>
      <Provider>
        <MenuProvider>
          <NavigationContainer>
              <Root/>
          </NavigationContainer>
        </MenuProvider>
      </Provider>
    </ApolloProvider>
  );
}
