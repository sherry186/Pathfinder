import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput, HelperText, Button, IconButton } from 'react-native-paper';
import { scale, verticalScale, moderateScale } from '../../scaling_utils';

import { gql, useMutation } from '@apollo/client';
const SIGNUP = gql`
mutation signUp($name: String!, $email: String!, $password:String!) {
  signUp(input: {
    name: $name,
    email: $email,
    password: $password
  }) {
    id
  }
}
`;

export default function SignUp1({navigation}) {

  const [name,setname] = useState('');
  const [email,setemail] = useState('');
  const [password,setpassword] = useState('');
  const [hide_password, sethide_password] = useState(true);

  const [signUp, {error}] = useMutation(SIGNUP);

  const handleSubmit = () => {
    console.log(name, email, password);
    signUp({ variables: { name, email, password } });
    navigation.navigate('onboarding');
    // navigation.navigate('signUp2', {email: email})
  }

  const hasErrors = () => {
    if (email=='') { return false }
    else { return !email.includes('@'); }
  }
  if(error) { 
    console.log(error);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}> 
          <IconButton icon="chevron-left" color={'rgba(0,0,0,1)'} size={moderateScale(30)} onPress={() => navigation.goBack()}/>
      </View>
      <View style={styles.text_container}>
      <Text style={styles.word}>創建一個帳號</Text>
      <Text style={styles.word2}>創建帳號以開啟屬於自己的旅程</Text>
      </View>
      
      <TextInput 
        style = {styles.box1}
        label = "名字"
        mode = 'outlined'
        onChangeText = {name => setname(name)}
        defaultValue={name}
        theme={{colors:{primary:'#EF6C00'}}}
      />
      <TextInput 
        style = {styles.box2}
        label = "電子信箱"
        mode = 'outlined'
        onChangeText = {email => setemail(email)}
        defaultValue={email}
        theme={{colors:{primary:'#EF6C00'}}}
      />
      
      <HelperText type='error' visible={hasErrors()} style={styles.helpertext}>請輸入有效電子信箱</HelperText>
      
      <TextInput
        style = {styles.box3}
        label = "密碼"
        mode = 'outlined'
        onChangeText = {password => setpassword(password)}
        defaultValue={password}
        right={<TextInput.Icon name="eye" style={styles.eye} onPress={() => sethide_password(!hide_password)}/>}
        secureTextEntry = {hide_password}
        theme={{colors:{primary:'#EF6C00'}}}
      />
      
      <View style={styles.button_container}>
      <Button mode = 'contained' color='#EF6C00' style={styles.button} 
              onPress={() => handleSubmit()}>
        <Text style={styles.textinbutton}>創建</Text>
      </Button>
      </View>
      <StatusBar style="auto" translucent={false}/>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  word: {
    //position: 'absolute',
    //top: verticalScale(116),
    //left: scale(107),
    //fontFamily: "Noto Sans TC", 
    fontSize: moderateScale(24),
    fontWeight: "500"
  },
  box1: {
    position: 'absolute',
    top: verticalScale(216),
    width: scale(328),
    height: verticalScale(52),
    borderRadius: 4,
    backgroundColor: '#FAFAFA',
    alignSelf:'center'
  },
  box2: {
    position: 'absolute',
    top: verticalScale(292),
    width: scale(328),
    height: verticalScale(52),
    borderRadius: 4,
    backgroundColor: '#FAFAFA',
    //marginTop:verticalScale(20),
    alignSelf:'center'
  },
  box3: {
    position: 'absolute',
    top: verticalScale(368),
    width: scale(328),
    height: verticalScale(52),
    borderRadius: 4,
    backgroundColor: '#FAFAFA',
    alignSelf:'center'
    //marginTop:verticalScale(20)
  },
  button:{
    //position: 'absolute',
    //top: verticalScale(588),
    alignItems: 'center',
    width: moderateScale(93),
    height: moderateScale(48),
    borderRadius: 36,
    //opacity: 0.6,
    padding: 4
  },
  textinbutton:{
    color:"#FAFAFA", 
    fontSize: moderateScale(16), 
    //fontFamily:"Noto Sans TC", 
    textAlignVertical: 'center',
    fontWeight: "500"
  },
  eye:{
    top: verticalScale(5),
    left: scale(1),
    opacity: 0.6
  },
  helpertext:{
    position: 'absolute',
    top: verticalScale(344),
    left: scale(28),
    fontSize: moderateScale(12)
  },
  text_container:{
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'flex-start',
    marginTop: verticalScale(40),
    paddingLeft: scale(16),
  },
  word2:{
    fontSize:moderateScale(14),
    color: 'rgba(0,0,0,0.6)',
    marginTop: verticalScale(8)
  },
  textinput_container:{
    //flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    //marginTop:verticalScale(48),
    backgroundColor:'yellow'
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
  },
  helpertext_container:{
    backgroundColor:'pink'
  },
  header:{
    height: verticalScale(48),
    backgroundColor: '#fff'
  },
});

