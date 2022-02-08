import { isNonNullObject } from '@apollo/client/utilities';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, SafeAreaView, FlatList, View, TextInput, Image } from 'react-native';
import { Appbar, Divider, IconButton, List, Snackbar, Title, Button } from 'react-native-paper';
import { scale, verticalScale, moderateScale } from '../../scaling_utils';
import {
  MenuProvider,
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

import { gql, useQuery, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// for dev, user fixed id
const DEV = false;
const USERIDFORDEV = "611dc9c4a0f373fb620152a9";

const GETUSERTAGS = gql`
query getUserTags($userId: ID!){
  getUserTags(userId: $userId)
}`;

const CREATETAG = gql`
mutation addUserTag($userId: ID!, $tagName: String!){
  addUserTag(userId: $userId, tagName: $tagName)
}`;

const DELETETAG = gql`
mutation deleteUserTag($userId: ID!, $tagKey: String!){
  deleteUserTag(userId: $userId, tagKey: $tagKey)
}`;

const UPDATETAG = gql`
mutation updateTagName($userId: ID!, $tagKey: String!, $tagName: String!) {
  updateTagName(userId: $userId, tagKey: $tagKey, tagName: $tagName)
}`;

var testUserTags={
    12:"線上課程",
    3: "心得",
    21: "數學",
    4: "讀書方法",
    1: "英文"
}

var testTags=["線上課程","心得","數學","讀書方法","英文"]

export default function tag_List({navigation}) {
  
  // var tags_array = Object.keys(testUserTags);  //keys組成的array
  // console.log(tags_array);
  const [clickedId, setClickedId] = useState(null);
  const [showsnackbar, setShowsnackbar] = useState(false);
  const onDismissSnackBar = () => setShowsnackbar(false);
  const [addtag, setAddtag] = useState(false);
  const [tagname, setTagname] = useState();
  const [userId, setUserId] = useState(null);
  
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

  const [createTag] = useMutation(CREATETAG);
  const [deleteTag] = useMutation(DELETETAG);
  const [updatetag] = useMutation(UPDATETAG);

  console.log(data);

  if(data) {
    var tags_array = Object.keys(data.getUserTags);  //keys組成的array
    console.log(tags_array);
  }

  //Flatlist Item
  const Item = ({ item }) => {
    const [tagInput, setTagInput] = useState(false);
    const [tagname, setTagname] = useState(data.getUserTags[item])

    const handleSelectMenu = (value, key) => {
      console.log(value);
      if(value == "編輯名稱") {
        setTagInput(true);
      }

      if(value == "刪除") {
        deleteTag({ variables: { userId: (DEV? USERIDFORDEV : userId), tagKey: key } })
      }
    }

    const updateTag = () => {
      updatetag({ variables: { userId: (DEV? USERIDFORDEV : userId), tagKey: item, tagName: tagname} })
      //data.getUserTags[item] = tagname;
      setTagInput(false);
    }

    const pressedTag = () => {
      console.log(tagname);
      navigation.navigate("record_Homepage", {filterTag: tagname});
    }

    return (
    <>
      {
        tagInput? (
          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <IconButton
                          icon="label-outline"
                          style={styles.label_outline_icon}
                          size={moderateScale(19)}
                          color={"rgba(0,0,0,0.87)"}/> 
              <TextInput 
                  style={styles.title}
                  placeholder='標題'
                  onChangeText = {title => setTagname(title)}
                  defaultValue = {data.getUserTags[item]}
              />
              {/* <Title style={styles.title}>{testUserTags[item]}</Title> */}
            </View>
            <IconButton
              onPress={()=> updateTag()}
              icon="check" 
              size={moderateScale(19)}
              color={"#EF6C00"}>
            </IconButton>
          </View>
        ) : (      
        <View style={styles.tagContainer1}>
          <View style={styles.tag}>                    
            <IconButton
                        icon="label-outline"
                        style={styles.label_outline_icon}
                        size={moderateScale(19)}
                        color={"rgba(0,0,0,0.87)"}/> 
          <Button style={styles.tagButton} contentStyle={styles.tagContent} color="#EF6C00" onPress={()=> pressedTag()}>
            <Title style={styles.title}>{data.getUserTags[item]}</Title>
          </Button>
          </View>
          <Menu onSelect={value => handleSelectMenu(value, item)}>
            <MenuTrigger children={<IconButton
              icon="dots-vertical"
              style={styles.dots_vertical_icon}
              size={moderateScale(19)}
              color={"rgba(0,0,0,0.87)"}/>} />
            <MenuOptions customStyles={optionsStyles}>
              <MenuOption value="編輯名稱" text="編輯名稱" />
              <MenuOption value="刪除" text="刪除" />
            </MenuOptions>
          </Menu>
        </View>
      )
      }
    </>
    
  )};
  
  const renderItem = ({ item }) => {
    return (
      <Item item={item}/>
    );
  };

  const handleAddTag = () => {
    setAddtag(false); 
    createTag({ variables: {  userId: (DEV? USERIDFORDEV : userId), tagName:　tagname } })
    //testUserTags[58]=tagname; 
    setTagname("");
  }

  return (  
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.appbar_header}>
          <Appbar.Action icon="chevron-left" size={25} color="rgba(0,0,0,0.87)" onPress={() => navigation.goBack()} />
          <Appbar.Content titleStyle={styles.appbar_title} title="標籤" color="rgba(0,0,0,0.87)" style={styles.appbar_content}/>      
      </Appbar.Header>
      <Button icon="plus" style={styles.createTagContainer} onPress={() => setAddtag(true)} color="rgba(0, 0, 0, 0.6)" labelStyle={{ fontSize: 20, width: scale(280), textAlign: "left" }}>   
        增加標籤
      </Button> 
      { addtag && 
        <View style={styles.addtag}>
          <IconButton icon="close" color={'rgba(0,0,0,0.6)'} size={moderateScale(19)} 
                      onPress={() => {setAddtag(false); setTagname("");}} style={styles.cross_icon}/>
          <TextInput style={styles.box_addtag} onChangeText = {tagname => setTagname(tagname)} defaultValue = {tagname}/>
          <IconButton icon="check" color={'#EF6C00'} size={moderateScale(19)} 
                                                        //到時候須將58改成新的key
                      onPress={() => handleAddTag()} style={styles.check_icon}/>
        </View>
      }
      <FlatList
        style={addtag? styles.flatlist_addtag: styles.flatlist_noaddtag}
        data={tags_array}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        extraData={clickedId}
      />  
      
      <Snackbar
        theme={{ colors: { accent: '#EF6C00', surface: 'rgba(0,0,0,0.6)' }}}
        style={styles.snackbar}
        visible={showsnackbar}
        duration={5000}
        onDismiss={onDismissSnackBar}
        action={{ label: '復原', onPress: () => { /*復原state*/ } }} >
        已將標籤刪除
      </Snackbar> 
      
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const optionsStyles = {
  optionsContainer: {
    padding: 5,
    width: scale(128),
    height: scale(90)
  },
  optionWrapper: {
    margin: 5,
  },
  optionTouchable: {
    activeOpacity: 70,
  },
  optionText: {
    fontWeight: "500",
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: moderateScale(16),
    lineHeight: moderateScale(20),
    letterSpacing: moderateScale(0.15)
  },
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  appbar_header: {
    width: scale(360),
    height: verticalScale(48),
    // top: verticalScale(-380),
    // left: scale(-180),
    // position: 'absolute',
    backgroundColor: '#fff',
    // paddingLeft: scale(19),
    // paddingRight: scale(19),
    elevation: 1,
    marginHorizontal: scale(12),
    marginVertical: scale(9)
  },
  appbar_content: {
    backgroundColor: '#fff',
    alignItems: 'flex-start',
    paddingLeft: 0
  },
  appbar_title: {
    fontWeight: "500",
    fontSize: moderateScale(20),
    lineHeight: moderateScale(24),
    color: 'rgba(0, 0, 0, 0.87)',
    letterSpacing: moderateScale(0.15)
  },
  divider: {
    position: 'absolute',
    top: verticalScale(73),
    width: scale(360),
    height: verticalScale(1),
    color: 'rgba(0,0,0,0.08)'
  },
  flatlist_noaddtag: {
     //position: 'absolute',
     //top: verticalScale(120)
  },
  flatlist_addtag:{
     //position: 'absolute',
     //top: verticalScale(168),

  },
  item: {
    height: verticalScale(48),
    width: scale(360),
    marginVertical: 0,
    marginHorizontal: 0,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  snackbar:{
    position: 'absolute',
    top: verticalScale(-100),  
    left: scale(9),
    backgroundColor: '#fff',
    borderRadius: 0,
    width: scale(328),
    height: verticalScale(48)
  },
  box_addtag:{
    // position: 'absolute',
    // top: verticalScale(0),
    // left: scale(60),
    height: verticalScale(48),
    width: scale(200),
    fontSize: moderateScale(20),
    backgroundColor: '#fff',
  },
  createTagContainer: {
    // position: 'absolute',
    // paddingLeft: scale(19),
    // paddingRight: scale(19),
    height: verticalScale(48),
    width: scale(360),
    marginHorizontal: scale(12),
    marginVertical: scale(9),
    // top: verticalScale(72),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: moderateScale(20),
    fontWeight: '500'
  },
  addtag:{
    height: verticalScale(48),
    marginHorizontal: scale(12),
    marginVertical: scale(9),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontWeight: "500",
    fontSize: moderateScale(20),
    lineHeight: moderateScale(24),
    color: 'rgba(0, 0, 0, 0.87)',
    letterSpacing: moderateScale(0.15)
  },
  tagButton: {
    margin: 0,
    padding: 0,
  },
  tagContent: {

  },
  tag:{
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: scale(19)
  },
  tagContainer: {
    //width: scale(360),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: scale(16),
    marginVertical: scale(9),
    //paddingLeft: scale(19),
    //paddingRight: scale(19),
  },
  tagContainer1: {
    width: scale(360),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // paddingLeft: scale(19),
    paddingRight: scale(19),
    height: verticalScale(48)
  },
  menu: {
    height: scale(90),
    width: scale(50)
  },
  
});