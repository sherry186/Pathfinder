import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import { scale, verticalScale, moderateScale, windowHeight, windowWidth } from '../../scaling_utils';

export default function Onboarding ({navigation}) {
  return (
    <View style={styles.container}>
      <Text style={styles.word1}>一起展開旅程</Text>
      <Button mode = 'contained' color='#EF6C00' style={styles.button} 
              onPress={() => navigation.navigate('signIn')}>
            <Text style={styles.textinbutton}>登入</Text>
      </Button>
      <View style={styles.text_container}>
      <Text style={styles.word2}>你還沒有帳號嗎？</Text>
      <Text style={styles.text} 
            onPress={() => navigation.navigate('signUp1')}>立即註冊</Text>
      </View>
      <StatusBar style="auto" translucent={false}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  word1: {
    position: 'absolute',
    top: verticalScale(81),
    left: scale(16),
    //fontFamily: "Noto Sans TC", 
    fontSize: moderateScale(24,0.4),
    fontWeight: "500"
  },
  word2:{
    //position: 'absolute',
    //top: verticalScale(684),
    //left: scale(81),
    //fontFamily: "Noto Sans TC", 
    fontSize: moderateScale(16),
    fontWeight: "400"
  },
  button:{
    position: 'absolute',
    top: verticalScale(586),
    alignItems: 'center',
    width: moderateScale(93),
    height: moderateScale(48),
    borderRadius: 36,
    padding: 3
},
  textinbutton:{
    color:"#FAFAFA", 
    fontSize: moderateScale(16), 
    fontWeight: "500", 
    //fontFamily:"Noto Sans TC", 
    textAlignVertical: 'center'
  },
  text:{
    //position: 'absolute',
    //top: verticalScale(684),
    //right: scale(81),
    color: "#EF6C00", 
    fontSize: moderateScale(16), 
    //fontFamily: "Noto Sans TC",
    fontWeight: "400"
  },
  text_container:{
    position: 'absolute',
    top: verticalScale(684),
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  }
});