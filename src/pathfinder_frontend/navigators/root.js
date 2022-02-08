import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { moderateScale, verticalScale } from '../scaling_utils';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Onboarding from '../screens/signIn/onboarding';
import SignIn from '../screens/signIn/signIn';
import SignUp1 from '../screens/signUp/signUp1';
import SignUp2 from '../screens/signUp/signUp2';
import SignUp2_1 from '../screens/signUp/signUp2_1';
import SignUp3 from '../screens/signUp/signUp3';
import addorupdate from '../screens/record/addOrUpdate';
import record_home from '../screens/record/homepage';
import dashboard_home from '../screens/dashboard/homepage';
import discover_home from '../screens/discover/homepage';
import profile_home from '../screens/profile/homepage';
import select_Tags from '../screens/record/selectTags';
import tag_List from '../screens/record/tagList';
import pick_images from '../screens/record/pickimages';
import photo_edit from '../screens/record/photoEdit';
import select_Dep from '../screens/discover/selectDepartment';
import discover_details from '../screens/discover/details';
import select from '../screens/signIn/select';
import select_more from '../screens/signIn/selectMore';

const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator(){
    return(
        <Tab.Navigator 
            initialRouteName="record_Homepage"
            screenOptions={{ 
                tabBarActiveTintColor: '#EF6C00', 
                tabBarInactiveTintColor: 'rgba(0,0,0,0.6)', 
                headerShown: false,
                tabBarStyle: { position: 'absolute', height: verticalScale(60), elevation: 0, borderTopColor: '#fff'},
                tabBarIconStyle: { size: moderateScale(18), marginTop: verticalScale(3) }
            }}
            tabBarOptions={{ 
                labelStyle: { fontSize: moderateScale(12), bottom: verticalScale(10) },
                tabStyle: { backgroundColor: '#fff' }
            }}
        >
            <Tab.Screen 
                name="record_Homepage" 
                component={record_home}
                initialParams={{ filterTag: null }}
                options={{
                    tabBarLabel: "紀錄",
                    tabBarIcon: ({ color, size }) => (
                      <MaterialCommunityIcons name="file-document" color={color} size={size} />
                    )
                  }} />
            <Tab.Screen 
                name="dashboard_homepage" 
                component={dashboard_home} 
                options={{
                    tabBarLabel: "儀表板",
                    tabBarIcon: ({ color, size }) => (
                      <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />
                    )
                }} />
            <Tab.Screen 
                name="discover_homepage" 
                component={discover_home}
                options={{
                    tabBarLabel: "探索",
                    tabBarIcon: ({ color, size }) => (
                      <MaterialCommunityIcons name="compass-outline" color={color} size={size} />
                    )
                }} />
            <Tab.Screen 
                name="profile_homepage" 
                component={profile_home} 
                options={{
                    tabBarLabel: "帳戶",
                    tabBarIcon: ({ color, size }) => (
                      <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} />
                    )
                }} />
        </Tab.Navigator>
    )
}

function Root() {
    return (
        <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName='onboarding'>

            <RootStack.Screen
                name="onboarding" 
                component={Onboarding}>
            </RootStack.Screen>

            <RootStack.Screen
                name="signIn" 
                component={SignIn}>
            </RootStack.Screen>

            <RootStack.Screen
                name="select" 
                component={select}
                initialParams={{ dep_array: [] }}>
            </RootStack.Screen>

            <RootStack.Screen
                name="selectMore" 
                component={select_more}>
            </RootStack.Screen>

            <RootStack.Screen
                name="signUp1" 
                component={SignUp1}>
            </RootStack.Screen>

            <RootStack.Screen
                name="signUp2" 
                component={SignUp2}>
            </RootStack.Screen>

            <RootStack.Screen
                name="signUp2_1" 
                component={SignUp2_1}>
            </RootStack.Screen>

            <RootStack.Screen
                name="signUp3" 
                component={SignUp3}>
            </RootStack.Screen>

            <RootStack.Screen
                name="record_homepage" 
                component={TabNavigator}>
            </RootStack.Screen>

            <RootStack.Screen
                name="addOrUpdate" 
                component={addorupdate}>
            </RootStack.Screen>

            <RootStack.Screen
                name="selectTags" 
                component={select_Tags}>
            </RootStack.Screen>

            <RootStack.Screen
                name="tagList" 
                component={tag_List}>
            </RootStack.Screen>

            <RootStack.Screen
                name="pickimages" 
                component={pick_images}>
            </RootStack.Screen>

            <RootStack.Screen
                name="photoedit" 
                component={photo_edit}>
            </RootStack.Screen>

            <RootStack.Screen
                name="discover_homepage" 
                component={discover_home}>
            </RootStack.Screen>


            <RootStack.Screen
                name="selectDepartment" 
                component={select_Dep}>
            </RootStack.Screen>

            <RootStack.Screen
                name="discover_details" 
                component={discover_details}>
            </RootStack.Screen>
            
        </RootStack.Navigator>   
        
    );
}

export default Root;