import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Image, ScrollView, Dimensions, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { Appbar, IconButton, Modal, Portal, Provider, Chip } from 'react-native-paper';
import { scale, verticalScale, moderateScale } from '../../scaling_utils';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Slider from '@react-native-community/slider';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { gql, useMutation, useQuery } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// for dev, user fixed id
const DEV = false;
const USERIDFORDEV = "611dc9c4a0f373fb620152a9";

const {width} = Dimensions.get("window");
const height = width * 328/360;

const CREATERECORD = gql`
mutation createRecord($userId: ID!, $title: String!, $description: String!, $feeling: Float!) {
  createRecord(userId: $userId, title: $title, description: $description, feeling: $feeling){
    id
  }
}`;

const UPDATERECORD = gql`
mutation updateRecord($id: ID!, $title: String!, $description: String!, $feeling: Float!){
  updateRecord(
    id: $id,
    title: $title,
    description: $description, 
    feeling: $feeling
  ){
    id
  }
}`;

const DELETERECORDS = gql `
mutation deleteRecord($ids: [ID]!){
  deleteRecord(ids: $ids) 
}`;

const GETRECORDTAGS = gql`
query getRecordTags($recordId: ID!) {
  getRecordTags(recordId: $recordId)
}`;

const UPLOADDOCUMENT = gql`
mutation uploadDocument($recordId: [ID]!) {
  uploadDocument(recordId: $recordId)
}`;


export default function addorupdate({navigation,route}) {

  const [title,settitle] = useState(route.params.title);
  const [description,setdescription] = useState(route.params.description);
  const [id, setId] = useState(route.params.id);
  const [userId, setUserId] = useState(null);
  const [feelings, setFeelings] = useState(route.params.feeling);
  const [seemodal, setSeemodal] = useState(false);
  var createdAt = route.params.createdAt;
  var updatedAt = route.params.updatedAt;
  const image_obj = route.params.image;
  const [imageidx, setImageidx] = useState(0);
  const [tags, setTags] = useState([]);
  
 
  var image = image_obj;
    // for(let count=0; count < route.params.image.length; count++){
    //   image[count] = image_obj[count].uri;
    // }
  console.log('image', image);

  var month, date = 0;
  const now = new Date;
  if(updatedAt!=''){
    month = updatedAt[5]==0? updatedAt[6]:updatedAt[5]+updatedAt[6];
    date = updatedAt[8]==0? updatedAt[9]:updatedAt[8]+updatedAt[9];
  }
  else { 
     month = now.getMonth()+1;
     date = now.getDate();
  }

  const [createRecord] = useMutation(CREATERECORD, {
    variables: { userId: (DEV? USERIDFORDEV : userId), title, description, feeling: feelings },
    onCompleted({createRecord}) {
      setId(createRecord.id);
    }
  });

  const [updateRecord] = useMutation(UPDATERECORD, {
    variables: { id, title, description, feeling: feelings }
  });

  const [deleteRecord] = useMutation(DELETERECORDS);

  const [uploadDocument] = useMutation(UPLOADDOCUMENT, {
    variables: { recordId: [route.params.id] },
    async onCompleted( { uploadDocument } ) {
      //console.log("uplaod doc", uploadDocument);
      //setUploadString(uploadDocument);
      const uploadData = encodeURIComponent(uploadDocument);

      const serverUrl = "https://desolate-refuge-17724.herokuapp.com/docUrl?word="+uploadData;
      const { url } = await fetch(serverUrl)
       .then(res => res.json())

      await FileSystem.downloadAsync(
        url.split('?')[0],
        FileSystem.documentDirectory + route.params.id + '.docx'
      )
        .then(({ uri }) => {
          console.log('Finished downloading to ', uri);
          localUri = uri;
          Sharing.shareAsync(uri);
        })
        .catch(error => {
          console.error(error);
        });
      
    }
  });

  const { loading, error, data } = useQuery(GETRECORDTAGS, {
    variables: { recordId: id }, 
    onCompleted(data) { 
      setTags(Object.keys(data.getRecordTags));
    },
    pollInterval: 100
  });


  useEffect(()=> {
    if(data) {
      console.log(data);
      setTags(Object.keys(data.getRecordTags));
    }
  }, [data])

  const [lastTitle, setLastTitle] = useState("");
  const [lastDescription, setLastDescription] = useState("");
  const [lastFeeling, setLastFeeling] = useState(0.5);
  const AUTOSAVE_INTERVAL = 500;

  const getUserId = async () => {
    try {
      const value = await AsyncStorage.getItem('userId')
      if(value !== null) {
        // value previously stored
        return value;
      }
    } catch(e) {
      throw e;
    }
  }
  

  useEffect(() => {
    const timer = setTimeout(() => {
      if (lastTitle !== title || lastDescription !== description || lastFeeling !== feelings) {
        if (id == null) { //not yet created
          console.log('need to create record');
          console.log(typeof userId, typeof title, typeof description);
          createRecord();
        } else {
          console.log('need to update record');
          updateRecord();
        }
        setLastTitle(title);
        setLastDescription(description);
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearTimeout(timer);
  }, [title, description, feelings]);



  //User進入這個頁面就啟動useEffect
  useEffect (() => {
    console.log('User opens add_or_update page.');
    getUserId().then((id) => {
      setUserId(id);
      console.log(userId);
    });
    getUserId().catch((err) => {throw err;});
  },[]);

  //點擊照片
  const singletap = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      console.log('singletaptap');
      navigation.navigate("photoedit", {title:title,description:description,createdAt:createdAt,updatedAt:updatedAt, id: id, image:image_obj, imageidx:imageidx});
    }
  }

  //滑動照片
  const handleScroll = ({nativeEvent}) => {
    const slide = Math.ceil(nativeEvent.contentOffset.x/nativeEvent.layoutMeasurement.width);
    if (slide!== imageidx) { setImageidx(slide); }
  }

  return (
    <Provider>
    <Portal>
    <View style={styles.container}>   
    {
      image.length>0 &&
      <View style={{position:'absolute', top: verticalScale(72), width, height,  backgroundColor:'#fff'}}>
        <TapGestureHandler onHandlerStateChange={singletap}>
        <ScrollView 
          pagingEnabled
          horizontal
          onScroll={handleScroll}
          showsHorizontalScrollIndicator={false}
          style={{width, height, backgroundColor: '#fff'}}>
        {
          image.map((item, index)=>(
            <View style={styles.imageContainer}>
              <Chip style= {styles.chip} textStyle= {styles.chiptext}>{index+1} / {image.length}</Chip>
              <Image
                key={index}
                source={{uri:item}}
                style={{width, height, resizeMode: 'cover', backgroundColor:'#fff', zindex: 2}}
              />
            </View>
          ))
        }
        </ScrollView>
        </TapGestureHandler>
      </View>
    }
    <SafeAreaView style={image.length==0? styles.content_noimage:styles.content_withimage}> 
    <ScrollView style={{marginHorizontal:scale(16), backgroundColor:'#fff'}}> 
    <TextInput 
        style={styles.textinput_title}
        placeholder='標題'
        onChangeText = {title => settitle(title)}
        defaultValue = {title}
    />
    <TextInput
        style={styles.textinput_description}
        placeholder="紀錄"
        onChangeText = {description => setdescription(description)}
        defaultValue = {description}
        multiline={true}
    />   
    </ScrollView>  
    </SafeAreaView>    
    <Appbar style={styles.appbar_leftbottom}>
        <Appbar.Action icon="image-plus" color="rgba(0,0,0,0.87)" onPress={() => navigation.navigate('pickimages',{title:title,description:description,createdAt:createdAt,updatedAt:updatedAt, id: id, image:image_obj})} />
        <Appbar.Action icon="label-outline" color="rgba(0,0,0,0.87)" onPress={() => navigation.navigate('selectTags', {title:title,description:description,createdAt:createdAt,updatedAt:updatedAt, id: id, image:image_obj, tags}) }/>
    </Appbar>
    <View style={styles.header}>
    <IconButton icon="chevron-left" style={{top:verticalScale(23)}} size={moderateScale(30)} color="rgba(0,0,0,0.87)" onPress={() => navigation.goBack()}/>
    <Menu style={{top:verticalScale(-28), left:scale(310)}}>
      <MenuTrigger children={<IconButton
          icon="dots-vertical"
          style={styles.dots_vertical_icon}
          size={moderateScale(22)}
          color={"rgba(0,0,0,0.87)"}/>}
      />
        <MenuOptions customStyles={optionsStyles}>
            <MenuOption 
              value="刪除" 
              text="刪除" 
              onSelect={() => {
                deleteRecord({ variables: { ids: [route.params.id] } });
                navigation.navigate("record_Homepage", {filterTag: null});
              }}/>
            <MenuOption 
              value="分享" 
              text="分享" 
              onSelect={() => {
                uploadDocument();
              }}/>
        </MenuOptions>
    </Menu>     
    { feelings==0 && 
      <TouchableOpacity style={styles.button} onPress={()=>setSeemodal(true)}>
        <Image style={styles.button} source={require('../../assets/verybad.png')} resizeMode='cover'/>
      </TouchableOpacity>
    } 
    { feelings==0.25 && 
      <TouchableOpacity style={styles.button} onPress={()=>setSeemodal(true)}>
        <Image style={styles.button} source={require('../../assets/bad.png')} resizeMode='cover'/>
      </TouchableOpacity>
    } 
    { feelings==0.5 && 
      <TouchableOpacity style={styles.button} onPress={()=>setSeemodal(true)}>
        <Image style={styles.button} source={require('../../assets/nuetral.png')} resizeMode='cover'/>
      </TouchableOpacity>
    } 
    { feelings==0.75 && 
      <TouchableOpacity style={styles.button} onPress={()=>setSeemodal(true)}>
        <Image style={styles.button} source={require('../../assets/good.png')} resizeMode='cover'/>
      </TouchableOpacity>
    } 
    { feelings==1 && 
      <TouchableOpacity style={styles.button} onPress={()=>setSeemodal(true)}>
        <Image style={styles.button} source={require('../../assets/verygood.png')} resizeMode='cover'/>
      </TouchableOpacity>
    } 
    </View>
    <Text style={styles.text}>上次編輯時間：{month}月{date}日</Text>
    <Modal visible={seemodal} onDismiss={()=>setSeemodal(false)} style={styles.modal}>
      <Text style={styles.textinmodal}>紀錄心情</Text>
      <Text style={styles.facetext_good}>極好</Text>
      <Text style={styles.facetext_bad}>極壞</Text>
      <Slider
        style={{width: 224, height: 40, top: verticalScale(0), zIndex: 1}}
        minimumValue={0}
        maximumValue={1}
        step={0.25}
        value={0.5}
        minimumTrackTintColor="black"
        maximumTrackTintColor="#000000"
        thumbTintColor="black"
        onValueChange={value=>setFeelings(value)}
      />
      <Image style={styles.badface} source={require('../../assets/badface.png')} resizeMode='cover'/>
      <Image style={styles.goodface} source={require('../../assets/goodface.png')} resizeMode='cover'/>
    </Modal>    
    <StatusBar style="auto" />
    </View>
    </Portal>
    </Provider>
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
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0
  },
  imageContainer: {
    height: height,
    width: width,
    zIndex: 1,
  },
  chip:{
    position: 'absolute',
    backgroundColor: '#fff',
    maxWidth: moderateScale(58),
    flexDirection: 'column',
    alignItems: 'center',
    // marginRight: scale(8),
    height: moderateScale(28),
    top: scale(12),
    right: scale(12),
    zIndex: 3,
    paddingLeft: 0,
    paddingRight:0
  },
  chiptext: {
    // marginRight: scale(8),
    // marginLeft: scale(8)
    fontSize: verticalScale(16),
  },
  content_noimage:{
    position:'absolute',
    height: verticalScale(640),
    width: scale(360),
    top: verticalScale(72),
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  content_withimage:{
    position: 'absolute',
    height: verticalScale(312),
    width: scale(360),
    //top: verticalScale(400),
    bottom: verticalScale(48),
    flexDirection: 'row',
    alignItems:'flex-start',
    justifyContent: 'flex-start',
    backgroundColor:'#fff'
  },
  appbar_header:{
    position: 'absolute',
    width: scale(200),
    height: verticalScale(48),
    top: verticalScale(-360),
    left: scale(-180),
    backgroundColor: '#fff'
  },
  appbar_leftbottom:{
    position: 'absolute',
    backgroundColor:'#fff',
    elevation: 0,
    bottom: 0,
    left: 0,
    height: verticalScale(48),
    width: scale(200)
  },
  textinput_title:{
    top: verticalScale(5),
    //left: scale(16),
    //right: scale(16),
    fontSize: moderateScale(24)
  },
  textinput_description:{
    top: verticalScale(5),
    //left: scale(16),
    //right: scale(16),
    fontSize: moderateScale(20),
    backgroundColor: '#fff',
    //height: 40
  },
  text:{
    position: 'absolute',
    bottom: verticalScale(16),
    right: scale(16),
    fontSize: moderateScale(14,0.4),
    fontWeight: '400',
    color: 'rgba(0,0,0,0.6)'
  },
  wrapper:{
    position:'absolute',
    height: verticalScale(328),
    width: scale(360),
    top: verticalScale(72),
    backgroundColor: 'pink',
    //zIndex: 0
  },
  image_contain:{
      position: 'absolute',
      width:'100%',
      height:verticalScale(328),
      backgroundColor:'#fff',
      top: verticalScale(0),
      left: 0
      //zIndex: 1
  },
  /*_wrapper:{
    height: verticalScale(328),
    top: verticalScale(0),
    backgroundColor: 'yellow',
    zIndex: 1
  },*/
  /*dots_vertical_icon:{
    position: 'absolute',
    top: verticalScale(-50),
    right: scale(5)
  },*/
  button:{
    position: 'absolute',
    height: verticalScale(28),
    width: scale(73),
    top: verticalScale(4),
    right: scale(35)
  },
  header:{
    position:'absolute',
    top: verticalScale(30),
    height: verticalScale(48),
    width: scale(360),
    backgroundColor: '#fff',
    left: 0,
    //alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    height: verticalScale(171),
    width: scale(360),
    marginTop: verticalScale(599),
    left: 0,
    backgroundColor: '#fff',
    zIndex: 0,
    alignItems: 'center',
  },
  textinmodal:{
    fontSize: moderateScale(14),
    color: 'rgba(0,0,0,0.38)',
    left: scale(-65),
    marginTop: verticalScale(-60),
    //zIndex: 1
  },
  badface:{
    position: 'absolute',
    height: verticalScale(32),
    width: scale(32),
    top: verticalScale(0),
    left: scale(-35)
  },
  goodface:{
    position: 'absolute',
    height: verticalScale(32),
    width: scale(32),
    top: verticalScale(0),
    right: scale(-35)
  },
  facetext_good:{
    fontSize: moderateScale(14),
    color: 'rgba(0,0,0,0.6)',
    top: verticalScale(80),
    right: scale(-202)
  },
  facetext_bad:{
    fontSize: moderateScale(14),
    color: 'rgba(0,0,0,0.6)', 
    top: verticalScale(62), 
    left: scale(-34)
  }
});