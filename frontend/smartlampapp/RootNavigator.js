import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MyContext } from './configs/Contexts';

import UserNavigator from './UserNavigator';


const Stack = createStackNavigator();

const RootNavigator = () => {
  const { user } = useContext(MyContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="UserStack" component={UserNavigator} />

    </Stack.Navigator>
  );
};

export default RootNavigator;