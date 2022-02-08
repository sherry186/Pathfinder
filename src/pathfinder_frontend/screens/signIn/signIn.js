import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Dimension, Dimensions } from 'react-native';
import { TextInput, HelperText, Button, IconButton } from 'react-native-paper';
import { scale, verticalScale, moderateScale, windowHeight, windowWidth } from '../../scaling_utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { gql, useMutation } from '@apollo/client';
const LOGIN = gql`
mutation logIn($email: String!, $password:String!) {
	logIn(email: $email, password: $password) {
    id
  }
}`;

const storeUserId = async (value) => {
  try {
    await AsyncStorage.setItem('userId', value)
  } catch (e) {
    // saving error
    throw e;
  }
}




export default function SignIn({navigation}) {

  const [email,setemail] = useState('');
  const [password,setpassword] = useState('');
  const [hide_password, sethide_password] = useState(true);

  const getSelectCookieAndNavigateAccordingly = async () => {
    try {
      const value = await AsyncStorage.getItem('selectCookie')
      if(value !== null) {
        console.log('nav to record');
        navigation.navigate('select', { dep_array: [] });
        //navigation.navigate('record_homepage');
      }
      else {
        console.log('nav to select');
        navigation.navigate('select', { dep_array: [] });
      }
    } catch(e) {
      // error reading value
    }
  }

  const [logIn, {data, error, loading}] = useMutation(LOGIN,  {
    variables: { email, password },
    onCompleted({logIn}) {
      storeUserId(logIn.id);
      getSelectCookieAndNavigateAccordingly();
    }
  });

  const handleLogIn = () => {
    logIn();
  }

  return (
    <View style={styles.container}>
      {/* {!loading? <>  */}
        <View style={styles.header}> 
          <IconButton icon="chevron-left" color={'rgba(0,0,0,1)'} size={moderateScale(30)} onPress={() => navigation.goBack()}/>
        </View>
        <View style={styles.text_container}>
        <Text style={styles.word}>歡迎回來</Text>
        <Text style={styles.word2}>登入以繼續紀錄和探索自己的未來方向</Text>
        </View>
        <View style={styles.textinput_container}> 
        <TextInput 
          style = {styles.box1}
          label = "電子信箱"
          mode = 'outlined'
          onChangeText = {email => setemail(email)}
          defaultValue={email}
          theme={{colors:{primary:'#EF6C00'}}}
        />
        <TextInput 
          style = {styles.box2}
          label = "密碼"
          mode = 'outlined'
          onChangeText = {password => setpassword(password)}
          defaultValue={password}
          right={<TextInput.Icon name="eye" style={styles.eye} onPress={() => sethide_password(!hide_password)}/>}
          secureTextEntry = {hide_password}
          theme={{colors:{primary:'#EF6C00'}}}
        />
        {/* <Text style={styles.text} onPress={() => console.log('Pressed')}>忘記密碼</Text> */}
        </View>
        <View style={styles.button_container}>
        <Button mode = 'contained' color='#EF6C00' style={styles.button} onPress={handleLogIn}>
          <Text style={styles.textinbutton}>登入</Text>
        </Button>
        </View>
        <StatusBar style="auto" translucent={false}/>
        {/* </> : <ActivityIndicator/>} */}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  word: {
    fontSize: moderateScale(24),
    fontWeight: "500"
  },
  box1: {
    width: scale(328),
    height: verticalScale(52),
    borderRadius: 4,
    backgroundColor: '#FAFAFA'
  },
  box2: {
    width: scale(328),
    height: verticalScale(52),
    borderRadius: 4,
    backgroundColor: '#FAFAFA',
    marginTop:verticalScale(20)
  },
  button:{
    alignItems: 'center',
    width: moderateScale(93),
    height: moderateScale(48),
    borderRadius: 36,
    padding: 4
  },
  text:{
    color:"#EF6C00", 
    fontSize: moderateScale(16), 
    fontWeight: "400",
    alignSelf:'flex-end',
    paddingRight: scale(18),
    marginTop: verticalScale(20)
  },
  textinbutton:{
    color:"#FAFAFA", 
    fontSize: moderateScale(16), 
    fontWeight: "500", 
    textAlignVertical: 'center'
  },
  eye:{
    top:verticalScale(5),
    left:scale(1),
    opacity: 0.6
  },
  header:{
    height: verticalScale(48),
    backgroundColor: '#fff'
  },
  word2:{
    fontSize:moderateScale(14),
    color: 'rgba(0,0,0,0.6)',
    marginTop: verticalScale(8)
  },
  text_container:{
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'flex-start',
    marginTop: verticalScale(40),
    paddingLeft: scale(16),
  },
  textinput_container:{
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    marginTop: verticalScale(72),
  },
  button_container:{
    position:'absolute',
    width:'100%',
    alignItems:'center',
    justifyContent:'center',
    //paddingBottom:verticalScale(120),
    //marginTop: verticalScale(170),
    //backgroundColor:'pink',
    //bottom:verticalScale(104)
    top:verticalScale(592)
  }
});

