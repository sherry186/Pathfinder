import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, SafeAreaView, FlatList, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Searchbar, Divider, IconButton, Appbar, Snackbar, Button, Chip, Checkbox, Title } from 'react-native-paper';
import { Overlay } from 'react-native-elements';
import { scale, verticalScale, moderateScale } from '../../scaling_utils';
//import records from '../../testData/records';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { convertToWordAndShareHandler } from '../../output_file';

import { gql, useQuery, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// for dev, user fixed id
const DEV = false;
const USERIDFORDEV = "611dc9c4a0f373fb620152a9";

const GETRECORDS = gql`
query getRecords($userId: ID!){
  getRecords(userId: $userId) {
		id
    title
    tags
    description
    createdAt
    updatedAt
    images
    feeling
  }
}`;

const DELETERECORDS = gql `
mutation deleteRecord($ids: [ID]!){
  deleteRecord(ids: $ids) 
}`;

const UPLOADDOCUMENT = gql`
mutation uploadDocument($recordId: [ID]!) {
  uploadDocument(recordId: $recordId)
}`;

//for flatlist
const Item = ({ item, onPress, backgroundColor, borderColor, onLongPress }) => {
  
  var tagsObject = item.tags;
  var keysArray = Object.keys(item.tags);
  console.log('tagsObject', tagsObject);

  const renderTags = ( tags )=> {
    console.log(tags.item);
    console.log(tagsObject[tags.item]);
    return (
      <Chip style= {styles.chip} textStyle= {styles.chiptext}>{tagsObject[tags.item]}</Chip>
    )
  }

  return (
    <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor, borderColor]} onLongPress={onLongPress}> 
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
        <FlatList
          scrollEnabled={false}
          horizontal={true}
          style={styles.chipContainer}
          data={keysArray}
          renderItem={renderTags}
          keyExtractor={(item) => item}/>
      {/* <Chip>Example Chip</Chip>
      <Chip>Example Chip</Chip> */}
    </TouchableOpacity>
  )};


  const ListItem = ({ item, onPress, backgroundColor, borderColor, onLongPress })=>{

    // set date
    const date = (item.updatedAt).split('T')[0];
    const yyyymmdd = date.split('-');
    const time = ((item.updatedAt).split('T')[1]).split('.')[0];
    const hhmmss = time.split(':');
    const amOrPm = +hhmmss[0] < 12 ? '上午' : '下午'; // Set 上午/下午
    (hhmmss[0] > "12") ? hhmmss[0] = +hhmmss[0] % 12 || 12 : "";
    const dateTime = `已修改${yyyymmdd[0]}年${yyyymmdd[1]}月${yyyymmdd[2]}日 ${amOrPm}${hhmmss[0]}:${hhmmss[1]}`
    return ( 
      <TouchableOpacity onPress={onPress}  onLongPress={onLongPress} style={[styles.listItem, backgroundColor, borderColor]}> 
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{dateTime}</Text>
      </TouchableOpacity> )
  }

export default function record_home({navigation, route}) {
    
    const [searchQuery, setSearchQuery] = useState('');
    const [clickedId, setClickedId] = useState(null); //沒有長按之前的onpress => 進入編輯頁面
    const [selectedId, setSelectedId] = useState([]); //長按選擇的item
    const [visible, setVisible] = useState(false);
    const [filterTag, setFilterTag] = useState(route.params.filterTag);
    const [viewSwitcher, setViewSwitcher] = useState("KANBAN"); //LIST
    const [viewSwitcherModalVisible, setViewSwitcherModalVisible] = useState(false);
    const [sorter, setSorter] = useState("UPDATE"); //CREATE
    const [sorterModalVisible, setSorterModalVisible] = useState(false);
    const [recordData, setRecordData] = useState([]);
    const [docUrl, setDocUrl] = useState("")
    //const [uploadString, setUploadString] = useState("");
    const onDismissSnackBar = () => setVisible(false);

    const [deleteRecord] = useMutation(DELETERECORDS);
    const [uploadDocument] = useMutation(UPLOADDOCUMENT, {
      variables: { recordId: selectedId },
      async onCompleted( { uploadDocument } ) {
        //console.log("uplaod doc", uploadDocument);
        //setUploadString(uploadDocument);
        const uploadData = encodeURIComponent(uploadDocument);

        const serverUrl = "https://desolate-refuge-17724.herokuapp.com/docUrl?word="+uploadData;
        const { url } = await fetch(serverUrl)
         .then(res => res.json())
        setDocUrl(url.split('?')[0]);

        // var localUri = "";
        await FileSystem.downloadAsync(
          url.split('?')[0],
          FileSystem.documentDirectory + selectedId + '.docx'
        )
          .then(({ uri }) => {
            console.log('Finished downloading to ', uri);
            // localUri = uri;
            Sharing.shareAsync(uri);
          })
          .catch(error => {
            console.error(error);
          });
        // console.log(localUri);
        // Sharing.shareAsync(localUri);
      }
    });

    const [userId, setUserId] = useState(null);


    const getUserId = async () => {
      try {
        const value = await AsyncStorage.getItem('userId')
        //console.log('userid',value);
        if(value !== null) {
          // value previously stored
          return value;
        }
      } catch(e) {
        throw e;
      }
    }
  
    const handleDelete = () => {
      deleteRecord({ variables: { ids: selectedId } });
      setSelectedId([]); 
      setVisible(true); 
    }

    const handleCloseTag = () => {
      setFilterTag(null);
    }

    useEffect (() => {
      //console.log('User opens record hompage.');
      getUserId().then((id) => {
        setUserId(id);
        //console.log(userId);
      });
      getUserId().catch((err) => {throw err;});
    },[]);

    useEffect (() => {
      setFilterTag(route.params.filterTag);

    }, [route.params.filterTag])

    const { loading, error, data } = useQuery(GETRECORDS, {
      variables: { userId: (DEV? USERIDFORDEV : userId　) }, 
      pollInterval: 100,
      // onCompleted( { getRecords } ) { 
      //   setRecordData(getRecords);
      //   console.log('record data:', getRecords);
      // }
    });

    const returnData = (sortedBy) => {
      if(!data) {return}
      let recordData_ = data.getRecords;
      //sort by date
      if (sortedBy == "UPDATE") {
        recordData_ = recordData_.slice().sort(function (a, b) {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        })
      } else {
        recordData_ = recordData_.slice().sort(function (a, b) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
      }
      console.log('sorted', recordData_);

      return recordData_;
    }

    useEffect (()=> {
      setRecordData(returnData(sorter));
    }, [data])

    console.log(data, loading, error);
    
    //search
    const [searchdata, setSearchdata] = useState([]);
    const handleSearch = (query) => {
      setSearchQuery(query);
      if(loading==false && error==undefined){
        if(filterTag) {
          var fulldata = recordData.filter(record => Object.values(record.tags).includes(filterTag));
        } else {
          var fulldata = recordData;
        }     
        
        if(query=='') { return }
        else {
          const _data = fulldata.filter(function(element){ 
          if (element.title.includes(query) || element.description.includes(query)) { return true; }
          else { return false; } });
          setSearchdata(_data);
        }
      }
    }

    //convert to word and share
    const prepare_output_data = async () => {
      console.log('selected id', selectedId);
      uploadDocument();
      
      
      // let output_data = [];
      // for(let count=0 ; count<selectedId.length ; count++){
      //   const fulldata = data.getRecords;
      //   output_data = fulldata.filter(function(element){
      //     if(selectedId.includes(element.id)) { return true; }
      //     else { return false; }
      //   })
      // }
      // //console.log('output-data', output_data);
      // convertToWordAndShareHandler(output_data);
    }

    if (loading) return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator size="small" color="rgba(0, 0, 0, 0.87)" />
      </View>
    );
    if (error) return <Text>Error! ${error.message}</Text>;

    
    
    //目前還未選擇item
    if (selectedId.length==0){
        //console.log(records);
        const renderItem = ({ item }) => {
          
          const backgroundColor = '#fff';
          const borderColor = 'rgba(0,0,0,0.16)';

          if(viewSwitcher == "KANBAN"){
            return (
              <Item
                item={item}
                onPress={() => {
                  setClickedId(item.id); 
                  navigation.navigate('addOrUpdate',{title: item.title, description: item.description, 
                  createdAt: item.createdAt, updatedAt: item.updatedAt, id: item.id, image:item.images, feeling: item.feeling});
                }}  //這邊需要傳入images 之後要改成item.image
                onLongPress={() => {
                  setSelectedId(selectedId.concat(item.id));
                }}
                backgroundColor = {{ backgroundColor }}
                borderColor = {{ borderColor }} />                
            );
          } else {
            return(
            <ListItem
                item={item}
                onPress={() => {
                  setClickedId(item.id); 
                  navigation.navigate('addOrUpdate',{title: item.title, description: item.description, 
                  createdAt: item.createdAt, updatedAt: item.updatedAt, id: item.id, image:item.images, feeling: item.feeling});
                }}  //這邊需要傳入images 之後要改成item.image
                onLongPress={() => {
                  setSelectedId(selectedId.concat(item.id));
                }}
                backgroundColor = {{ backgroundColor }}
                borderColor = {{ borderColor }} /> )
          }
            
          };
        return (
          <SafeAreaView style={styles.container}>
            <Button mode = 'contained' color='#EF6C00' style={styles.button} 
              onPress={() => navigation.navigate('addOrUpdate',{title:'',description:'',createdAt:'',updatedAt:'', id: null, image:[], feeling: 0.5})}>
                <Text style={styles.textinbutton}>+</Text>
            </Button>          
            <StatusBar style="auto" translucent={false}/>
            <View style={styles.searchAndAppContainer}>
            <Searchbar
                style={styles.searchbar}
                placeholder="搜尋你的紀錄"
                //onChangeText={(query)=>{setSearchQuery(query);handleSearch(query);}} //原來:query => setSearchQuery(query) //後來: handleSearch 
                onChangeText={query => handleSearch(query)}
                value={searchQuery}
                theme={{backgroundColor:'#fff'}}
            />
            <Appbar style={styles.appbar}
            >
                {filterTag ? (
                  <Chip 
                    style= {styles.chip1} textStyle= {styles.chiptext}  
                    onClose={()=>handleCloseTag()}>{filterTag}</Chip>
                ) : (
                  <Appbar.Action icon="label-outline" color="rgba(0,0,0,0.6)" onPress={() => navigation.navigate("tagList") } />
                )}
                {/* <Appbar.Action icon="dots-vertical" color="rgba(0,0,0,0.6)" onPress={() => console.log('Pressed dots')} /> */}
            </Appbar> 
            </View>
            <View style={styles.sortAndViewSwitcherContainer}>
              <View style={styles.sortContainer}>
                { sorter == "UPDATE" ? 
                  <Text style={styles.text}>最新編輯</Text> : 
                  <Text style={styles.text}>最新建立</Text>
                }
                <IconButton
                    icon="chevron-down"
                    style={styles.chevron_icon}
                    size={moderateScale(20)}
                    color={'rgba(0,0,0,0.38)'}
                    onPress={() => setSorterModalVisible(true)}
                />
              </View>
              { viewSwitcher == "KANBAN" ?
              <IconButton
                  icon="view-agenda"
                  style={styles.view_agenda_icon}
                  size={moderateScale(20)}
                  color={'rgba(0,0,0,0.38)'}
                  onPress={() => setViewSwitcherModalVisible(true)}
              /> : <IconButton
                  icon="text-subject"
                  style={styles.view_agenda_icon}
                  size={moderateScale(20)}
                  color={'rgba(0,0,0,0.38)'}
                  onPress={() => setViewSwitcherModalVisible(true)}
              /> }
            </View> 
            {/* <Divider style={styles.divider}/>                    */}
            { data && <FlatList
                style={styles.flatlist_container}
                data={ 
                  filterTag? 
                   (searchQuery==''? recordData.filter(record => Object.values(record.tags).includes(filterTag)) : searchdata) : 
                   (searchQuery==''? recordData : searchdata)
                  } //原本: data.getRecords //後來: searchdata
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                extraData={clickedId}
            />}
            <Snackbar
                theme={{ colors: { accent: '#EF6C00', surface: 'rgba(0,0,0,0.6)' }}}
                style={styles.snackbar}
                visible={visible}
                duration={5000}
                onDismiss={onDismissSnackBar}
                action={{ label: '復原', onPress: () => { /*復原state*/ } }} >
            已將選擇紀錄刪除
            </Snackbar> 
            <Overlay isVisible={viewSwitcherModalVisible} overlayStyle={styles.modal} onBackdropPress={()=> setViewSwitcherModalVisible(false)}>
              <Text style={styles.textinmodal}>紀錄顯示</Text>
              <View style={styles.viewSwitcherContainer}>
              <View style={styles.iconTextWrapper}>
                  <IconButton
                      icon="text-subject"
                      //style={styles.chevron_icon}
                      size={moderateScale(20)}
                      color={'rgba(0,0,0,0.87)'}
                  />
                  <Title style={styles.title2}>清單</Title>
                </View>
                <Checkbox
                  color="#EF6C00"
                  status={viewSwitcher == "LIST" ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setViewSwitcher("LIST");
                    setViewSwitcherModalVisible(false)
                  }}
                />
              </View>
              <View style={styles.viewSwitcherContainer}>
                <View style={styles.iconTextWrapper}>
                  <IconButton
                      icon="view-agenda"
                      //style={styles.chevron_icon}
                      size={moderateScale(20)}
                      color={'rgba(0,0,0,0.87)'}
                  />
                  <Title style={styles.title2}>看板</Title>
                </View>
                <Checkbox
                  color="#EF6C00"
                  status={viewSwitcher == "KANBAN" ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setViewSwitcher("KANBAN");
                    setViewSwitcherModalVisible(false)
                  }}
                />
              </View>
            </Overlay>
            <Overlay isVisible={sorterModalVisible} overlayStyle={styles.modal} onBackdropPress={()=> setSorterModalVisible(false)}>
              <Text style={styles.textinmodal}>紀錄排序</Text>
              <View style={styles.viewSwitcherContainer}>
              <View style={styles.iconTextWrapper}>
                  <IconButton
                      icon="pencil-outline"
                      //style={styles.chevron_icon}
                      size={moderateScale(20)}
                      color={'rgba(0,0,0,0.87)'}
                  />
                  <Title style={styles.title2}>最新編輯</Title>
                </View>
                <Checkbox
                  color="#EF6C00"
                  status={sorter == "UPDATE" ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setSorter("UPDATE");
                    var record = returnData("UPDATE");
                    setRecordData(record);
                    setSorterModalVisible(false);
                  }}
                />
              </View>
              <View style={styles.viewSwitcherContainer}>
                <View style={styles.iconTextWrapper}>
                  <IconButton
                      icon="view-agenda"
                      //style={styles.chevron_icon}
                      size={moderateScale(20)}
                      color={'rgba(0,0,0,0.87)'}
                  />
                  <Title style={styles.title2}>最新建立</Title>
                </View>
                <Checkbox
                  color="#EF6C00"
                  status={sorter == "CREATE" ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setSorter("CREATE");
                    var record = returnData("CREATE");
                    setRecordData(record);
                    setSorterModalVisible(false);
                  }}
                />
              </View>
            </Overlay>
          </SafeAreaView>
        )
    }
    
    //已經選擇item
    else {
      console.log('in else');
      console.log(visible);
        const renderItem = ({ item }) => {
            
            const backgroundColor = selectedId.includes(item.id)==true ? "rgba(239, 108, 0, 0.16)" : "#fff";
            const borderColor = selectedId.includes(item.id)==true ? "rgba(239, 108, 0, 1)" : "rgba(0,0,0,0.16)";
            if(viewSwitcher == "KANBAN"){
              return (
                <Item
                  item={item}
                  onPress={() => 
                    { if(selectedId.includes(item.id)==false) { setSelectedId(selectedId.concat(item.id)); }
                      else { const _selectedId = selectedId.filter(function(element) { return element !== item.id }); 
                            setSelectedId(_selectedId); }
                    }}
                  onLongPress={() => {}}
                  backgroundColor = {{ backgroundColor }}
                  borderColor = {{ borderColor }} />
              ); 
            } else {
              return (
                <ListItem
                  item={item}
                  onPress={() => 
                    { if(selectedId.includes(item.id)==false) { setSelectedId(selectedId.concat(item.id)); }
                      else { const _selectedId = selectedId.filter(function(element) { return element !== item.id }); 
                            setSelectedId(_selectedId); }
                    }}
                  onLongPress={() => {}}
                  backgroundColor = {{ backgroundColor }}
                  borderColor = {{ borderColor }} /> 
              )
            }
        };
        return (
            <SafeAreaView style={styles.container}>
            <Button mode = 'contained' color='#EF6C00' style={styles.button} 
              onPress={() => navigation.navigate('addOrUpdate',{title:'',description:'',createdAt:'',updatedAt:'', id: null, image:[], feeling: 0.5})}>
                <Text style={styles.textinbutton}>+</Text>
            </Button>
            <Appbar style={styles.appbar_header}>
              <Appbar.Action icon="close" color={'#EF6C00'} onPress={()=>{console.log('pressed close'); setSelectedId([])}}/>
              <Appbar.Content color='#EF6C00' title={`${selectedId.length}選擇`} />
              {/* <Appbar.Action icon="label-outline" onPress={()=>console.log('pressed tags')} color={'#EF6C00'} /> */}
              <Appbar.Action icon="share-variant" color={'#EF6C00'} onPress={prepare_output_data} />
              <Appbar.Action icon="trash-can-outline" onPress={() => handleDelete()} color={'#EF6C00'} />
              {/* <Appbar.Action icon="dots-vertical" onPress={() => console.log('dots')} color={'#EF6C00'} /> */}
            </Appbar>
            <View style={styles.sortAndViewSwitcherContainer}>
              <View style={styles.sortContainer}>
                <Text style={styles.text}>最新編輯</Text>
                <IconButton
                    icon="chevron-down"
                    style={styles.chevron_icon}
                    size={moderateScale(20)}
                    color={'rgba(0,0,0,0.38)'}
                    onPress={() => console.log('Pressed')}
                />
              </View> 
              <IconButton
                  icon="view-agenda"
                  style={styles.view_agenda_icon}
                  size={moderateScale(20)}
                  color={'rgba(0,0,0,0.38)'}
                  onPress={() => console.log('Pressed')}
              />      
            </View>      
            <StatusBar style="auto" translucent={false}/>
            <FlatList
                style={styles.flatlist_container}
                data={
                  filterTag? 
                   (searchQuery==''? recordData.filter(record => Object.values(record.tags).includes(filterTag)) : searchdata) : 
                   (searchQuery==''? recordData : searchdata)
                }
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                extraData={selectedId}
            />
            </SafeAreaView>
        );
    }

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      // alignItems: 'center',
      // justifyContent: 'center',
    },
    searchAndAppContainer: {
      width: scale(360),
      height: verticalScale(48),
      paddingLeft: scale(4),
      // paddingRight: scale(4),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    appbar:{
      // position: 'absolute',
      backgroundColor: '#fff',
      //right: scale(16),
      // top: verticalScale(24),
      //width: scale(70),
      height: verticalScale(48),
      elevation: 0
    },
    searchbar:{
      // position: 'absolute',
      // top: verticalScale(24),
      width: scale(250),
      // left: 0,
      height: verticalScale(48),
      backgroundColor: '#fff',
      borderRadius: 0,
      elevation: 0
    },
    sortAndViewSwitcherContainer:{
      width: scale(360),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: scale(4),
      paddingRight: scale(4)
    },
    sortContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: "space-evenly",
      marginLeft: scale(12)
    },
    divider:{
      position: 'absolute',
      top: verticalScale(71),
      width: scale(360),
      height: verticalScale(1),
      color: 'rgba(0,0,0,0.08)'
    },
    
    flatlist_container:{
      zIndex: 0,
      // marginTop: verticalScale(120),
      // marginBottom: verticalScale(60)
    },
    item: {
      padding: 20,
      marginVertical: verticalScale(8),
      marginHorizontal: '4.44%',
      borderWidth: 1,
      borderRadius: 8
    },
    listItem: {
      padding: 8,
      marginVertical: verticalScale(4),
      marginHorizontal: '4.44%',
      borderRadius: 8
    },
    title: {
      fontSize: moderateScale(20),
      color: 'rgba(0,0,0,0.87)',
      lineHeight: moderateScale(24)
    },
    description: {
      fontSize: moderateScale(16),
      lineHeight: moderateScale(20),
      color: 'rgba(0,0,0,0.6)',
      paddingBottom: verticalScale(12)
    },    
    snackbar: { //position好奇怪qq
      position: 'absolute',
      top: verticalScale(-280),  
      left: scale(9),
      backgroundColor: '#fff',
      elevation: 8,
      borderRadius: 0,
      width: scale(328),
      height: verticalScale(48)
    },
    appbar_header:{
      // position: 'absolute',
      // left: 0,
      // right: 0,
      // top: verticalScale(30),
      height: verticalScale(48),
      elevation: 0,
      backgroundColor: '#fff'
    },
    chevron_icon:{
      // position: 'absolute',
      // top: verticalScale(78),
      // left: scale(65)
    },
    view_agenda_icon:{
      // position: 'absolute',
      // top:verticalScale(78),
      // right: scale(10)
    },
    button:{
      position: 'absolute',
      top: verticalScale(564),
      right: scale(16),
      width: scale(56),
      height: scale(56),
      borderRadius: scale(50),
      //opacity: 0.6,
      padding: 4,
      elevation: 6,
      zIndex: 1
    },
    textinbutton:{
      color:"#FAFAFA", 
      textAlign: 'center',
      textAlignVertical: 'center',
      fontSize: moderateScale(20)
    },
    text:{
      // position: 'absolute',
      // top: verticalScale(87),
      // left: scale(16),
      color: 'rgba(0,0,0,0.38)',
      fontSize: moderateScale(14,0.4),
      fontWeight: '400'
    },
    text2: {
      position: 'absolute',
      top: verticalScale(44),
      left: scale(52),
      fontSize: verticalScale(14),
      color: '#EF6C00',
      letterSpacing: 1
    },
    chipContainer:{

    },
    chip: {
      backgroundColor: 'rgba(239, 108, 0, 0.16)',
      maxWidth: moderateScale(80),
      flexDirection: 'column',
      alignItems: 'center',
      marginRight: scale(8),
      height: moderateScale(28)
    },
    chip1: {
      backgroundColor: 'rgba(239, 108, 0, 0.16)',
      color: '#EF6C00',
      maxWidth:moderateScale(100),
      flexDirection: 'column',
      alignItems: 'center',
      height: moderateScale(28)
    },
    chiptext: {
      color: "#EF6C00",
      fontSize: moderateScale(14),
      lineHeight: moderateScale(18),
      textAlign: "center",
      letterSpacing: moderateScale(0.25),
    },
    modal: {
      height: verticalScale(171),
      width: scale(360),
      marginTop: verticalScale(599),
      left: 0,
      backgroundColor: '#fff',
    },
    textinmodal:{
      fontSize: moderateScale(14),
      color: 'rgba(0,0,0,0.38)',
      paddingLeft: scale(12)
      // left: scale(-65),
      // marginTop: verticalScale(-60),
      //zIndex: 1
    },
    viewSwitcherContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: scale(4),
      marginTop: scale(4)
    },
    iconTextWrapper: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    title2:{
      fontSize:moderateScale(16),
      marginLeft: scale(16)
    }
  });