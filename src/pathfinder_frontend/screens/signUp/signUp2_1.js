import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput, IconButton, Button } from 'react-native-paper';
import { scale, verticalScale, moderateScale } from '../../scaling_utils';

export default function SignUp2({navigation, route}) {

  const [verificationCode,setverificationCode] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}> 
        <IconButton icon="chevron-left" color={'rgba(0,0,0,1)'} size={moderateScale(30)} onPress={() => navigation.goBack()}/>
      </View>
      <View style={{alignItems:'center', justifyContent:'center'}}>
      <Text style={styles.word1}>{route.params.email}</Text>
      <Text style={styles.word2}>驗證碼已重新寄送至以上電子信箱，{"\n"}&#12288;&#12288;&#12288;請輸入驗證碼完成驗證</Text>
      <TextInput 
        style = {styles.box}
        label = "驗證碼"
        mode = 'outlined'
        onChangeText={verificationCode => setverificationCode(verificationCode)}
        defaultValue={verificationCode}
        theme={{colors:{primary:'#EF6C00'}}}
      />
      <Button mode='text' style={styles.text} color='black'
              onPress={() => navigation.navigate('signUp2_1',{email: route.params.email})}>重新傳送</Button>
      </View>
    <StatusBar style="auto" translucent={false}/>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    //alignItems: 'center',
    //justifyContent: 'center',
  },
  word1: {
    position: 'absolute',
    //alignItems: 'center',
    top: verticalScale(112),
    //fontFamily: "Noto Sans TC", 
    fontSize: moderateScale(20),
    color: "#EF6C00",
    fontWeight: "500"
  },
  word2: {
    color: "rgba(0,0,0,0.6)",
    position: 'absolute',
    alignItems: 'center',
    top: verticalScale(148),
    //fontFamily: "Noto Sans TC", 
    fontSize: moderateScale(14),
    fontWeight: "400"
  },
  box: {
    position: 'absolute',
    top: verticalScale(240),
    width: scale(328),
    height: verticalScale(52),
    borderRadius: 4,
    backgroundColor: '#FAFAFA'
  },
  text:{
    position: 'absolute',
    top: verticalScale(344),
    alignItems: 'center',
    fontSize: moderateScale(14),
    //color: "#000",
    //fontWeight: "400"
  },
  header:{
    height: verticalScale(48),
    backgroundColor: '#fff'
  },
});

