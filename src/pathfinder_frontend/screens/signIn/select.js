import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, IconButton, Chip } from 'react-native-paper';
import { scale, verticalScale, moderateScale } from '../../scaling_utils';
import { intersted_major, interested_major_index } from '../../table';
import { gql, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CREATEINTERESTEDDEPARTMENT = gql`
mutation createInterestedDepartment($userId: ID!, $department: [Int]!){
  createInterestedDepartment(userId: $userId, department: $department) {
    id
    userId
    department
  }
}`;

const UPDATEINTERESTEDDEP = gql`
mutation updateInterestedDepartment($userId: ID!, $department: [Int]!){
  updateInterestedDepartment(userId: $userId, department: $department) {
    id
    userId
    department
  }
}`;

// for dev, user fixed id
const DEV = false;
const USERIDFORDEV = "611dc9c4a0f373fb620152a9";


// for this phase of testing, the cookie is not stored
const storeSelectCookie = async () => {
  try {
    await AsyncStorage.setItem('selectCookie', "TRUE")
  } catch (e) {
    // saving error
    throw e;
  }
}

export default function select({navigation,route}) {
  const [createInterestedDepartment] = useMutation(CREATEINTERESTEDDEPARTMENT);
  const [updateInterestedDepartment] = useMutation(UPDATEINTERESTEDDEP);
  const [userId, setUserId] = useState(null);

  const [interestedDep, setInterestedDep] = useState(route.params.dep_array); //選擇的學類index
  const dep_from_selectmore = route.params.dep_array;
  var newadd = [];

  // useEffect(() => {
  //   storeSelectCookie();
  // }, [])

  const getUserId = async () => {
    try {
      const value = await AsyncStorage.getItem('userId')
      console.log('userId ; ', value);
      if(value !== null) {
        // value previously stored
        return value;
      }
    } catch(e) {
      throw e;
    }
  }

  useEffect (() => {
    console.log('User opens record hompage.');
    getUserId().then((id) => {
      setUserId(id);
      //console.log(userId);
    });
    getUserId().catch((err) => {throw err;});
  },[]);

  useEffect(()=> {
    setInterestedDep(route.params.dep_array);
  }, [route.params.dep_array])
  
  for(let i=0;i<dep_from_selectmore.length;i++){ //把interested_major中沒有的item放到newadd以便render
    if(interested_major_index.includes(dep_from_selectmore[i].index)==false){
      newadd = newadd.concat(dep_from_selectmore[i]);
    }
  }

  const submitInterestedDepartments = () =>{
    let totalDep_ = interestedDep.map( x => x.index)

    console.log('totalDep',totalDep_);
    //createInterestedDepartment({variables: {userId: (DEV? USERIDFORDEV : userId), department: totalDep_}});
    updateInterestedDepartment({variables: {userId: (DEV? USERIDFORDEV : userId), department: totalDep_}});
    navigation.navigate("record_homepage");
  }
  
  console.log('new', newadd);
  console.log('hi', interestedDep);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="chevron-left" color={'rgba(0,0,0,1)'} size={moderateScale(30)} onPress={() => navigation.goBack()}/>
        <Text style={{fontSize:moderateScale(16), color:'rgba(0,0,0,0.38)'}} onPress={()=>navigation.navigate("record_homepage")}>略過</Text>
      </View>
      <View style={styles.title_container}>
        <Text style={styles.title}>選擇您有興趣的學類</Text>
        <Text style={styles.text}>請在以下區域中，選擇至多5個您有興趣的學類</Text>
      </View>
      <View style={styles.chips_container}>
        {
          intersted_major.map((item)=>(
            <Chip mode={'outlined'} key={item.index} 
                  style={interestedDep.includes(item)==true?styles.selectedchip:styles.not_selectedchip}
                  textStyle={interestedDep.includes(item)==true?styles.selectedText:styles.not_selectedText}
                  onPress={()=>{
                    if(interestedDep.includes(item)==false && interestedDep.length<5){
                      setInterestedDep(interestedDep.concat(item));
                    }
                    else{
                      const _interested = interestedDep.filter(function(element){ return element.index !== item.index });
                      setInterestedDep(_interested);
                    }
                  }}>
              {item.name}
            </Chip>
          ))
        }
        {
          newadd.map((item)=>(
            <Chip mode={'outlined'} key={item.index} 
                  style={interestedDep.includes(item)==true?styles.selectedchip:styles.not_selectedchip}
                  textStyle={interestedDep.includes(item)==true?styles.selectedText:styles.not_selectedText}
                  onPress={()=>{
                    if(interestedDep.includes(item)==false && interestedDep.length<5){
                      setInterestedDep(interestedDep.concat(item));
                    }
                    else{
                      const _interested = interestedDep.filter(function(element){ return element.index !== item.index });
                      setInterestedDep(_interested);
                    }
                  }}>
              {item.name}
            </Chip>
          ))
        }
      </View>
      <View style={styles.seemore}>
        <Text style={styles.seemore_text}>查看所有學類</Text>
        <IconButton icon="chevron-right" color={'rgba(0,0,0,0.6)'} onPress={() => navigation.navigate("selectMore",{dep_array:interestedDep})}/>
      </View>
      <View style={styles.button_container}>
        <Text style={styles.notice}>已選擇{interestedDep.length}個學類</Text>
        <Button mode = 'contained' color='#EF6C00' style={styles.button} onPress={()=>submitInterestedDepartments()}>
          <Text style={styles.textinbutton}>繼續</Text>
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
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    paddingRight:scale(17)
  },
  title_container:{
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'flex-start',
    marginTop: verticalScale(40),
    paddingLeft: scale(16),
  },
  title:{
    fontSize: moderateScale(24),
    fontWeight: "500"
  },
  text:{
    fontSize:moderateScale(14),
    color: 'rgba(0,0,0,0.6)',
    marginTop: verticalScale(8)
  },
  chips_container:{
    flexDirection:'row',
    //justifyContent:'flex-start',
    //alignItems:'center',
    marginTop: verticalScale(80),
    paddingLeft: scale(16),
    flexWrap:'wrap'
  },
  not_selectedchip:{
    borderColor: 'rgba(0,0,0,0.6)',
    backgroundColor: '#fff',
    borderRadius: 36,
    borderWidth: 1,
    marginRight: scale(8),
    marginBottom: verticalScale(12)
  },
  not_selectedText:{
    color: 'rgba(0,0,0,0.6)',
    fontSize: moderateScale(16)
  },
  selectedchip:{
    borderColor: 'rgba(0,0,0,0.87)',
    backgroundColor: 'rgba(0,0,0,0.87)',
    borderRadius: 36,
    marginRight: scale(8),
    marginBottom: verticalScale(12),
    borderWidth:1
  },
  selectedText:{
    color: '#fff',
    fontSize: moderateScale(16)
  },
  seemore:{
    flexDirection:'row',
    alignItems:'center',
    //height: verticalScale(20),
    justifyContent:'flex-start',
    paddingLeft:scale(28),
    paddingTop: verticalScale(8),
    //backgroundColor:'pink'
  },
  seemore_text:{
    color:'rgba(0,0,0,0.87)',
    fontSize:moderateScale(16),
    fontWeight:'400'
  },
  button_container:{
    flexDirection:'column',
    justifyContent:'space-around',
    alignItems:'center',
    position:'absolute',
    bottom:verticalScale(48),
    width:'100%'
  },
  notice:{
    color:'#EF6C00',
    fontSize:moderateScale(14)
  },
  button:{
    alignItems: 'center',
    width: moderateScale(93),
    height: moderateScale(48),
    borderRadius: 36,
    padding: 4,
    elevation:0,
    marginTop:verticalScale(16)
  },
  textinbutton:{
    color:"#FAFAFA", 
    fontSize: moderateScale(16), 
    textAlignVertical: 'center',
    fontWeight: "500"
  },
});