import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { verticalScale, moderateScale } from '../../scaling_utils';

export default function SignUp3() {
  return (
    <View style={styles.container}>
      <IconButton icon='check-circle' color="rgba(0,0,0,0.87)" size={verticalScale(95.33)} 
                  style={{position:'absolute', top:verticalScale(204), alignItems: 'center'}}></IconButton>
      <Text style={ styles.word }>完成建立帳號</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    position: 'absolute',
    top: verticalScale(332),
    //fontFamily: "Noto Sans TC", 
    fontSize: moderateScale(20,0.4),
    alignItems: 'center',
    fontWeight: "500"
  }
});