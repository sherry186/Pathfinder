import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView } from 'react-native';
import { Appbar, Button, Dialog, Portal, Provider, IconButton } from 'react-native-paper';
import { scale, verticalScale, moderateScale } from '../../scaling_utils';

import { gql, useMutation } from '@apollo/client';

const DELETEIMAGE = gql`
mutation deleteImage($recordId: ID!, $uri:String!){
  deleteImage(recordId: $recordId, uri: $uri)
}`;

export default function photo_edit({navigation, route}) {
  
  var image_uri = route.params.image;
  var image_idx = route.params.imageidx;

  const[image, setImage] = useState(image_uri);
  const[title, setTitle] = useState((route.params.imageidx+1)+'/'+route.params.image.length);

  const [deleteImage] = useMutation(DELETEIMAGE);
  
  var image_obj=image;
  const [seedialog, setSeedialog] = useState(false);

  

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.backAndTitleContainer}>
            <IconButton icon="chevron-left" style={{top:verticalScale(0)}} size={moderateScale(30)} color="rgba(0,0,0,0.87)" 
                        onPress={() => navigation.navigate("addOrUpdate", 
                                      {title:route.params.title,description:route.params.description,createdAt:route.params.createdAt,updatedAt:route.params.updatedAt,id:route.params.id,image:image_obj})}/> 
            <Text style={styles.appbar_title}>{title}</Text>
          </View>
          <Button icon="trash-can-outline" mode = 'contained' color='#fff' style={styles.button} onPress={()=>setSeedialog(true)} >
              <Text style={styles.textinbutton}>刪除</Text>
          </Button>
        </View>
        <Portal>
          <Dialog visible={seedialog} onDissmiss={()=>setSeedialog(false)}> 
          <Dialog.Title>刪除此照片？</Dialog.Title>
          <Dialog.Actions>
              <Button onPress={()=>{setSeedialog(false)}}>
                  <Text style={{color:'#EF6C00'}}>取消</Text>
              </Button>
              <Button onPress={()=>{
                deleteImage( { variables: { recordId: route.params.id, uri: image_uri[image_idx] } } );
                if(image_uri.length !== 1) {
                  image_obj.splice(image_idx, 1);
                } else {
                  image_obj = [];
                }
                
                setSeedialog(false); //刪除此張照片(補)
                navigation.navigate("addOrUpdate", {
                  title:route.params.title,
                  description:route.params.description,
                  createdAt:route.params.createdAt,
                  updatedAt:route.params.updatedAt,
                  id:route.params.id,
                  image:image_obj
                })
              }}>
                <Text style={{color:'#EF6C00'}}>刪除</Text>
              </Button>
          </Dialog.Actions>
          </Dialog>
        </Portal>
        <View style={styles.wrapper}>
          <Image style={styles.image_contain} source={{uri:image_uri[image_idx]}}  resizeMode='contain'/>
        </View>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  headerContainer: {
    width: scale(360),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: verticalScale(4),
    marginTop: verticalScale(14)
  },
  backAndTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  appbar_title: {
    // position:'absolute',
    fontSize: moderateScale(20),
    // top: verticalScale(36),
    // left: scale(52)
  },
  button:{
    // position: 'absolute',
    // top: verticalScale(30),
    // right: 0,
    // width: scale(110),
    // height: verticalScale(48),
    // alignContent: 'center',
    // borderRadius: 0,
    elevation: 0
  },
  textinbutton:{
    color:"rgba(0,0,0,0.87)", 
    fontSize: moderateScale(16), 
    fontWeight: "500", 
    textAlignVertical: 'center'
  },
  wrapper:{
    height: verticalScale(668),
    top: verticalScale(0),
    backgroundColor: '#fff',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  paginationStyle: {
    bottom: 100,
},
  image_contain:{
      position: 'absolute',
      width:'100%',
      height:'100%',
      backgroundColor:'#fff'     
  }

});