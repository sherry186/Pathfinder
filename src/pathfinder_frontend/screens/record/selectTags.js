import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, SafeAreaView, FlatList, View } from 'react-native';
import { Searchbar, Divider, List, Checkbox, IconButton } from 'react-native-paper';
import { scale, verticalScale, moderateScale } from '../../scaling_utils';

import { gql, useQuery, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// for dev, user fixed id
const DEV = false;
const USERIDFORDEV = "611dc9c4a0f373fb620152a9";

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

const ADDTAGS = gql`
mutation addTagsToRecord($recordId: ID!, $tags: JSONObject!) {
  addTagsToRecord(recordId: $recordId, tags: $tags){
    id
    tags
    title
  }
}`;

const GETRECORDTAGS = gql`
query getRecordTags($recordId: ID!) {
  getRecordTags(recordId: $recordId)
}`;

const GETUSERTAGS = gql`
query getUserTags($userId: ID!){
  getUserTags(userId: $userId)
}`;

const CREATETAGSFROMRECORD = gql`
mutation createTagsFromRecord($recordId: ID!, $userId: ID!, $tagName: String!) {
  createTagsFromRecord(recordId: $recordId, userId: $userId, tagName: $tagName)
}`;


var testUserTags={
  dfg: "線上課程",
  asd: "心得",  
  vc: "數學",  
  qwerty: "讀書方法",  
  ee: "英文"
}




export default function select_Tags({navigation, route}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState(route.params.tags);
  const [showadd, setShowadd] = useState(false);
  const [userId, setUserId] = useState(null);
  {console.log(selectedTags);}

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

  const { loading, error, data } = useQuery(GETUSERTAGS, {
    variables: { userId: (DEV? USERIDFORDEV : userId　) }, 
    pollInterval: 100
  });


  const [addTags] = useMutation(ADDTAGS);
  const [createTag] = useMutation(CREATETAGSFROMRECORD);

  console.log(data);

  if(data) {
    var tagsList = Object.keys(data.getUserTags);
    var tagsList_value = Object.values(data.getUserTags);
  }

  const [searchtag, setSearchtag] = useState([]);
    const handleSearch_tag = (query) => {
      setSearchQuery(query);
      if(loading==false && error==undefined){
        const tagList_keyandvalue = Object.entries(data.getUserTags); //所有tag的[key, value]
        if (query=='' || tagsList_value.includes(query)) { setShowadd(false); return }
        else {
          if(tagList_keyandvalue.length > 0) {
            const _tags = tagList_keyandvalue.filter(function(element){ 
              if (element[1].includes(query)) {
                //if(element[1]===query) { setShowadd(false); console.log('showadd', showadd) }
                //else { setShowadd(true) } 
                setShowadd(true);
                return true;           
              }
              else { setShowadd(true); return false; } 
            });
            setSearchtag(_tags.map(x=>x[0]));  //裡面存搜尋到的tag的key
            console.log('showadd_out',showadd);
          } else { 
            setShowadd(true); 
            return false; 
          }
          
          
        }
      }
    }
       
  

  //Flatlist Items
  const Item = ({ item }) => {

    const handleSelectTag = ()=> {
      
      if(selectedTags.includes(item)==false) {
        var newSelectedTags = selectedTags.concat(item);
        setSelectedTags(newSelectedTags); 
      }
      else { 
        newSelectedTags = selectedTags.filter(function(element) { return element !== item }); 
        setSelectedTags(newSelectedTags); 
      }

      let tags = Object.keys(data.getUserTags)
       .filter(key => newSelectedTags.includes(key))
       .reduce((obj, key) => {
         obj[key] = data.getUserTags[key];
         return obj;
       }, {});


      addTags({ variables: { recordId: route.params.id, tags }});
    }
    
    return (
    <List.Item
    title={data.getUserTags[item]}
    titleStyle={{color:"rgba(0,0,0,0.87)", fontSize: moderateScale(20)}}
    left={props => <List.Icon {...props} icon="label-outline" color="rgba(0,0,0,0.87)" style={{justifyContent:'center'}}/>}
    right={props => <Checkbox.Item {...props} status={selectedTags.includes(item)?'checked':'unchecked'} uncheckedColor="#EF6C00" color="#EF6C00" 
            onPress={() => handleSelectTag()}
            style={{top:verticalScale(3)}}/>}
    style={styles.item}
    />
  );}

  const renderItem = ({ item }) => {
    return (
      <Item item={item} />
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <Searchbar
        icon="chevron-left"
        style={styles.searchbar}
        placeholder="搜尋或增加標籤"
        onChangeText={query => handleSearch_tag(query)}
        value={searchQuery}
        onIconPress={() => navigation.navigate("addOrUpdate", 
                     {title:route.params.title,description:route.params.description,createdAt:route.params.createdAt,updatedAt:route.params.updatedAt,id:route.params.id,image:route.params.image})}
        
      />
      { data ? (
      <FlatList
        style={showadd? styles.flatlist_container_add: styles.flatlist_container_noadd}
        data={searchQuery==""? tagsList : searchtag}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        extraData={selectedTags}
      /> ) : <></>
      }
      <Divider style={styles.divider}/>
      { console.log('showadd_outtttt', showadd)}
      { showadd &&  
        <View style={styles.addtag}>
          <IconButton icon="plus" color={'#EF6C00'} size={moderateScale(19)} style={{position:'absolute', left: scale(13)}}
                      onPress={() => {
                        console.log("pressed addTag button!");
                        createTag( { variables: { recordId: route.params.id, userId: (DEV? USERIDFORDEV : userId ), tagName: searchQuery } } );
                        setShowadd(false); 
                        setSearchQuery(""); 
                      }} 

          />
          <Text style={styles.new}>新增 </Text>
          <Text style={styles.tagname}>{searchQuery}</Text>
          
        </View>
      }
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchbar: {
    position: 'absolute',
    top: verticalScale(24),
    width: scale(360),
    left: 0,
    height: verticalScale(48),
    backgroundColor: '#fff',
    borderRadius: 0,
    elevation: 0
  },
  divider: {
    position: 'absolute',
    top: verticalScale(73),
    width: scale(360),
    height: verticalScale(1),
    color: '#rgba(0,0,0,0.08)'
  },
  item: {
    //padding:3,
    height: verticalScale(48),
    width: scale(360),
    marginVertical: 0,
    marginHorizontal: 0,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  flatlist_container_noadd: {
    marginTop: verticalScale(72),
    marginBottom: verticalScale(0)
  },
  flatlist_container_add: {
    marginTop: verticalScale(120),
    marginBottom: verticalScale(0)
  },
  addtag:{
    position:'absolute',
    top:verticalScale(72),
    left:0,
    height: verticalScale(48),
    width: scale(360),
    paddingLeft: scale(19),
    paddingRight: scale(19),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  new:{
    position: 'absolute',
    color: 'rgba(0,0,0,0.87)',
    fontSize: moderateScale(20),
    left: scale(52)
  },
  tagname:{
    position: 'absolute',
    color: 'rgba(0,0,0,0.87)',
    fontSize: moderateScale(20),
    left: scale(105)
  }
  
  
});