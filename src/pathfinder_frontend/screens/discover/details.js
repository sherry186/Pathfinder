import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image } from 'react-native';
import { IconButton, Chip, Title, Button } from 'react-native-paper';
import { scale, verticalScale, moderateScale } from '../../scaling_utils';
import * as Linking from 'expo-linking';
import { type, total_department, total_major } from '../../table';

export default function discover_details({navigation,route}) {

  const activity = route.params.activity;

  const locationParser = () => {
    if(activity.location == null || activity.location == "線上") {
      return "線上";
    } 
    const parselocation = activity.location.split('T')[1];
    return parselocation;
  }

  return (
    <View style={styles.container}>
    <View style={styles.header}> 
      <IconButton icon="chevron-left" color={'rgba(0,0,0,1)'} size={moderateScale(30)} onPress={() => navigation.goBack()}/>
    </View>
    <SafeAreaView style={styles.safearea_container}>
      <ScrollView>
        <Image style={styles.cover} source={require('../../assets/details_image.png')} resizeMode='cover'/>
        <View style={styles.title_container}>
          <View style={{flexDirection:'row', justifyContent:'flex-start'}}>
          {
            activity.type.map((index)=>(
              <Chip mode={'flat'} style={styles.typeChip} textStyle={{color:'#EF6C00', fontSize:moderateScale(14)}}>{type[index-1]}</Chip>
            ))
          }
          </View>
          <Title style={{paddingTop:verticalScale(8), fontSize:moderateScale(24), lineHeight:moderateScale(32)}}>{activity.title}</Title>
        </View>
        <View style={{paddingTop:verticalScale(20), paddingLeft:scale(16), paddingRight:scale(16), flexDirection:'column', alignItems:'flex-start'}}>
          {activity.time && <Chip mode={'flat'} icon="calendar-range-outline" style={{backgroundColor:'#fff'}} textStyle={{color:'rgba(0,0,0,0.6)', fontSize:moderateScale(16)}}>{activity.time}</Chip>}
          <Chip mode={'flat'} icon="map-marker-outline" style={{backgroundColor:'#fff'}} textStyle={{color:'rgba(0,0,0,0.6)', fontSize:moderateScale(16)}}>{locationParser()}</Chip>
        </View>
        <View style={styles.information_container}>
          <Title style={{color:'rgba(0,0,0,0.38)', fontSize:moderateScale(16), paddingLeft:scale(16)}}>簡介</Title>
          <Text style={{color:'rgba(0,0,0,0.87)', fontSize:moderateScale(16), paddingLeft:scale(16), paddingRight:scale(16)}}>{activity.description}</Text>
          <Title style={{color:'rgba(0,0,0,0.38)', fontSize:moderateScale(16), marginTop:verticalScale(32), paddingLeft:scale(16)}}>主辦單位</Title>
          <Text style={{color:'rgba(0,0,0,0.87)', fontSize:moderateScale(16), paddingLeft:scale(16), paddingRight:scale(16)}}>{activity.host}</Text>
          <Title style={{color:'rgba(0,0,0,0.38)', fontSize:moderateScale(16), marginTop:verticalScale(32), paddingLeft:scale(16)}}>學類標籤</Title>
          <View style={styles.tagChip_container}>
            {
              activity.department.length!=0 &&
              activity.department.map((index)=>(
                <Chip mode={'flat'} style={styles.tagChip} textStyle={{color:'#EF6C00', fontSize:moderateScale(14)}}>{total_department[index-1].name}</Chip>
              ))
            }
            {
              activity.major.length!=0 &&
              activity.major.map((index)=>(
                <Chip mode={'flat'} style={styles.tagChip} textStyle={{color:'#EF6C00', fontSize:moderateScale(14)}}>{total_major[index-1].name}</Chip>
              ))
            }
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    <View style={styles.button_container}>
      <Button mode="outlined" color={'#EF6C00'} onPress={()=>Linking.openURL(activity.url)} style={styles.button} >
        <Text style={{fontSize:moderateScale(16)}}>前往活動網站</Text>
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
  header:{
    height: verticalScale(48),
    backgroundColor: '#fff',
    opacity: 0.5,
    zIndex: 1
  },
  safearea_container:{
    height: verticalScale(636),
    backgroundColor:'#fff',
    marginTop: verticalScale(-48),
    zIndex: 0
  },
  cover:{
    height: verticalScale(208),
    width: '100%'
  },
  title_container:{
    paddingTop: verticalScale(12),
    paddingLeft: scale(16),
    paddingRight: scale(16),
    //height: verticalScale(250),
    backgroundColor: '#fff',
    flexDirection:'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  typeChip:{
    backgroundColor:'rgba(239, 108, 0, 0.16)',
    borderRadius: 4,
    marginRight:scale(8)
  },
  information_container:{
    backgroundColor: '#fff',
    marginTop: verticalScale(32),
    paddingBottom: verticalScale(124)
  },
  tagChip_container:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap:'wrap',
    paddingLeft: scale(16),
    paddingRight:scale(16),
    marginTop: verticalScale(8)
  },
  tagChip:{
    backgroundColor:'rgba(239, 108, 0, 0.16)', 
    borderRadius: 16,
    marginRight: scale(8),
    marginBottom: verticalScale(8)
  },
  button_container:{
    backgroundColor:'#fff',
    justifyContent: 'center',
    alignItems: 'center',
    height: verticalScale(104)
  },
  button:{
    borderColor:'#EF6C00',
    borderWidth:1,
    borderRadius:36,
    marginTop: verticalScale(8)
  }
});