import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, FlatList, ImageBackground, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from '../../scaling_utils';
import { Searchbar, IconButton, Chip, Provider, Dialog, Portal, Paragraph, Button, Title, Appbar, Modal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { gql, useQuery, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { set } from 'react-native-reanimated';
import { DatePickerModal } from 'react-native-paper-dates';
import 'intl';
import 'intl/locale-data/jsonp/en';

// for dev, user fixed id
const DEV = true;
const USERIDFORDEV = "611dc9c4a0f373fb620152a9";

const GETACTIVITIES = gql`
query getActivities($userId: ID!) {
  getActivities(userId: $userId) {
    id
    type
    department
    major
    title
    host
    location
    time
    url
    description
    abilities
    image
  }
}`;


const Item = ({ title, time, image, onPress }) => ( 
  <View style={styles.item_container}>
  <TouchableOpacity style={styles.listitem} onPress={onPress}>
  <ImageBackground style={{height:verticalScale(252), width:scale(328)}} source={image==null?require('../../assets/details_image.png'):{uri:image}} resizeMode='cover'>
    <LinearGradient colors={['rgba(0,0,0,0)','rgba(0,0,0,0.629)']} style={{flexDirection:'column', justifyContent:'flex-end', alignItems:'flex-start', paddingLeft:scale(16), height:verticalScale(252), width:scale(328), paddingBottom:verticalScale(16)}}>
    <Title style={styles.itemtitle}>{title}</Title>
    { time &&
    <View style={{ flexDirection:'row', alignItems:'center', marginLeft:scale(-10)}}>
      <IconButton icon="calendar-range-outline" color={'#fff'}/>
      <Text style={styles.itemtime}>{time}</Text>
    </View>}
    </LinearGradient>
  </ImageBackground>
  </TouchableOpacity>
  </View>  
);

export default function discover_home({navigation}) {
  /* date variables */
  const [range, setRange] = useState({ startDate: undefined, endDate: undefined });
  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState('');
  const [selectedChip, setSelectedChip] = useState(0);
  const [modalVisible, setModalVisible] = useState(true);
  const [activitiesData, setActivitiesData] = useState(null);
  const [fullActivitiesData, setFullActivitiesData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [seedotsmodal, setSeedotsmodal] = useState(false);
  const [seefiltermodal, setSeefiltermodal] = useState(false);
  //const [filtering, setFiltering] = useState(false);  //??????iconbutton??????????????????
  const [filter_time, setFilter_time] = useState(null);
  const [filter_place, setFilter_place] = useState(null);
  const [searchactivities, setSearchactivities] = useState([]);

  const handle_time = ( id ) => {
    switch (id){
      case "??????": { setFilter_time("??????"); break; }
      case "??????": { setFilter_time("??????"); break; }
      case "??????": { setFilter_time("??????"); break; }
      case "??????????????????": { setFilter_time("??????????????????"); break; }
    }
  } 

  // date functions
  const onDismiss = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirm = useCallback(
    ({ startDate, endDate }) => {
      setOpen(false);
      setRange({ startDate, endDate });
    },
    [setOpen, setRange]
  );

  const filterActivitiesDataByLocation = (array) => {
    if(filter_place == null) { 
      return array;
    }
    else if(filter_place == "??????") { 
      let filteredData = array.filter(
        data => {
          const location = data.location;
          return (location == null || location == "??????");
        })
      return filteredData;
     } 
    else {
      let filteredData = array.filter(
        data => {
          const location = data.location;
          if(location == null || location == "??????") { return false; }
          if(location.split('T')[0] == filter_place[0]) { return true; }
        })
      return filteredData;
     }
  }

  const filterActivitiesDataByType = (array) => {
    if(selectedChip == 0) {
      return array;
    } 
    return array.filter( ( data ) => {
      return (data.type).includes(selectedChip);
    })
  }

  const dateParser = (dateString) => {
    let date = dateString.split('/');
    if(date[2] == undefined) {
      return "Invalid Date";
    }

    date[2] = date[2].split('???')[0];
    //console.log('date', date);
    return new Date(date[0], date[1]-1, date[2])
  }

  function getStartOfWeek(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  function getEndOfWeek(date)
  {
    var lastday = date.getDate() - (date.getDay() - 1) + 6;
    return new Date(date.setDate(lastday));
  }

  const getStartDate = () => {
    if(filter_time == "??????") {
      return getStartOfWeek(new Date());
    } else if (filter_time == "??????") {
      return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    } else if (filter_time == "??????") {
      return new Date(new Date().getFullYear(), 0, 1);
    } else {
      console.log(range);
      return range.startDate;
    }
  }

  const getEndDate = () => {
    if(filter_time == "??????") {
      return getEndOfWeek(new Date());
    } else if (filter_time == "??????") {
      return new Date(new Date().getFullYear(), new Date().getMonth()+1, 0);
    } else if (filter_time == "??????") {
      return new Date(new Date().getFullYear(), 11, 31);
    } else {
      return range.endDate;
    }
  }

  const filterActivitiesDataByTime = (activities) => {
    if(filter_time == null) {
      return activities;
    }

    if(activities) {
      let filteredArray = activities.filter( ( { time } ) => {
        if(time == null) {
          return false;
        }
        //console.log(time);
        let startDateString = time.split('-')[0];
        let endDateString = time.split('-')[1];
        if(startDateString == undefined) {
          return false;
        } 
        else {
          let startD = dateParser(startDateString);
          let endD = (endDateString ? dateParser(endDateString) : null);
          let startDate = getStartDate();
          let endDate = getEndDate();
          //console.log(startDate, endDate);
          if(!endD) {
            return startD >= startDate && startD <= endDate;
          }
          else {
            return endD >= startDate && startD <= endDate;
          }
        }
        //console.log(`${startDate}-${endDate}`);
      });
      //console.log('filteredDagte', filteredArray);
      return filteredArray;
    }
    return activities;
  }

  const handle_place = ( id ) => {
    switch (id){
      case "??????": { 
        setFilter_place("??????"); 
        break; 
      }
      case "??????": { 
        setFilter_place("??????");
        break; 
      }
      case "??????": { 
        setFilter_place("??????"); 
        break; 
      }
      case "??????": { 
        setFilter_place("??????"); 
        break; 
      }
    }
  } 

  useEffect(()=> {
    let result = fullActivitiesData;
    result = filterActivitiesDataByLocation(result);
    result = filterActivitiesDataByType(result);
    result = filterActivitiesDataByTime(result);
    //console.log(result);
    setActivitiesData(result);
  }, [filter_place, selectedChip, filter_time, range])

    /* ??????????????????????????????Modal */
    const storeModal = async (value) => {
      try {
        await AsyncStorage.setItem('activityModalState', value)
      } catch (e) {
        // saving error
        console.log(e);
      }
    }
  
    const handleModal = () => {
      setModalVisible(false);
      storeModal("SHOWN");
    }
  
    const setModal = async () => {
      try {
        const value = await AsyncStorage.getItem('activityModalState')
        if(value !== null) {
          setModalVisible(false);
        }
      } catch(e) {
        // error reading value
      }
    }

  /* get userId and hasModalShwon first time this page renders */
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

  useEffect (() => {
    //console.log('User opens activity hompage.');
    getUserId().then((id) => {
      setUserId(id);
      //console.log(userId);
    });
    getUserId().catch((err) => {throw err;});
    setModal(); //set modal visible state according to local storage data

  },[]);


  /*get Activites data */
  const { loading, error, data } = useQuery(GETACTIVITIES, {
    variables: { userId: (DEV? USERIDFORDEV : userId???) }, 
    pollInterval: 500,
  });

  useEffect (() => {
    if(data) {
      setActivitiesData(data.getActivities);
      setFullActivitiesData(data.getActivities)
      // data ???????????????activitiesData?????????
    }
  }, [data])

  console.log('activity data', data, error, loading);


  if (loading) return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <ActivityIndicator size="small" color="rgba(0, 0, 0, 0.87)" />
    </View>
  );
  if (error) return <Text>Error! ${error.message}</Text>;

  const renderItem = ({ item }) => (
    <Item title={item.title} time={item.time} image={item.image}
          onPress={()=>navigation.navigate("discover_details", {activity:item})}
    />
  );

  //search
  const handleSearch = (query) => {
    setQuery(query);
    if(loading==false && error==undefined){ 
      if(query=='') { return }
      else {
        const _activities = activitiesData.filter(function(element){ 
        if (element.title.includes(query)) { return true; }
        else { return false; } });
        setSearchactivities(_activities);
      }
    }
  }

  const formatCustomDate = () => {
    if(range.startDate == undefined || range.endDate == undefined) {
      return "??????????????????";
    }
    else { 
      const startDate = range.startDate.toString().split(' ');
      const endDate = range.endDate.toString().split(' ');
      if(startDate[1] == endDate[1]) {
        return `${startDate[1]} ${startDate[2]}-${endDate[2]}, ${startDate[3]}`;
      } else {
        return `${startDate[1]} ${startDate[2]}, ${startDate[3]}-${endDate[1]} ${endDate[2]}, ${endDate[3]}`;
      }
    }
  }

  const resetTimeFilter = () => {
    setFilter_time(null);
    setRange({ startDate: undefined, endDate: undefined });
  }

  return (
    <Provider>
      <DatePickerModal
        // locale={'en'} optional, default: automatic
        style={{backgroundColor: "#EF6C00"}}
        mode="range"
        visible={open}
        onDismiss={onDismiss}
        startDate={range.startDate}
        endDate={range.endDate}
        onConfirm={onConfirm}
        // validRange={{
        //   startDate: new Date(2021, 1, 2),  // optional
        //   endDate: new Date(), // optional
        // }}
        // onChange={} // same props as onConfirm but triggered without confirmed by user
        // locale={'nl'} // optional
        // saveLabel="Save" // optional
        // label="Select period" // optional
        // startLabel="From" // optional
        // endLabel="To" // optional
        // animationType="slide" // optional, default is slide on ios/android and none on web
      />
    
    <View style={styles.container}>
      <View style={styles.header}> 
        <Searchbar
          style={styles.searchbar}
          placeholder="????????????" 
          onChangeText={query => handleSearch(query)}
          value={query}
          theme={{backgroundColor:'#fff'}}
        />
        
        <Appbar style={{height:verticalScale(48), backgroundColor:'#fff', elevation:0}}>
          <Appbar.Action icon="filter-outline" onPress={() => setSeefiltermodal(true)}/>
          <Appbar.Action icon="dots-vertical" onPress={() => setSeedotsmodal(true)}/>
        </Appbar>
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollView}>
          <Chip onPress={() => setSelectedChip(0)} mode={'outlined'} style={selectedChip==0? styles.selectedchip:styles.not_selectedchip} 
                textStyle={selectedChip==0? styles.selectedText:styles.not_selectedText}>??????</Chip>
          <Chip onPress={() => setSelectedChip(1)} mode={'outlined'} style={selectedChip==1? styles.selectedchip:styles.not_selectedchip} 
                textStyle={selectedChip==1? styles.selectedText:styles.not_selectedText}>??????</Chip>
          <Chip onPress={() => setSelectedChip(3)} mode={'outlined'} style={selectedChip==3? styles.selectedchip:styles.not_selectedchip} 
                textStyle={selectedChip==3? styles.selectedText:styles.not_selectedText}>??????????????????</Chip>
          <Chip onPress={() => setSelectedChip(2)} mode={'outlined'} style={selectedChip==2? styles.selectedchip:styles.not_selectedchip} 
                textStyle={selectedChip==2? styles.selectedText:styles.not_selectedText}>??????</Chip>
          <Chip onPress={() => setSelectedChip(4)} mode={'outlined'} style={selectedChip==4? styles.selectedchip:styles.not_selectedchip} 
                textStyle={selectedChip==4? styles.selectedText:styles.not_selectedText}>??????</Chip>
        </ScrollView>
      </View>
      <View style={{height:verticalScale(576)}}>
        <FlatList
          data={query==''?activitiesData:searchactivities}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      </View>
      <Portal>
        <Dialog visible={modalVisible} onDissmiss={()=>setModalVisible(false)} style={{borderRadius:0}}> 
          <Dialog.Title style={{fontWeight:'500', fontSize:moderateScale(20)}}>??????????????????</Dialog.Title>
          <Dialog.Content>
            <Paragraph><Text style={{fontSize: moderateScale(16), color:'rgba(0,0,0,0.6)'}}>
              ?????????????????????????????????????????????????????????????????????????????????
            </Text></Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
              <Button onPress={()=>handleModal()} style={{color:'#EF6C00'}}>
                  <Text style={{color:'#EF6C00', fontSize: moderateScale(16)}}>??????</Text>
              </Button>
          </Dialog.Actions>
        </Dialog>        
      </Portal>
      <Portal>
        <Modal visible={seedotsmodal} onDismiss={()=>setSeedotsmodal(false)} contentContainerStyle={styles.dotsmodal}> 
          <View style={{paddingLeft:scale(16), paddingRight:scale(16)}}>
            <Text style={{fontSize:moderateScale(24), paddingTop:verticalScale(16)}}>?????????????????????</Text>
            <Text style={{fontSize:moderateScale(14), paddingTop:verticalScale(4), color:'rgba(0,0,0,0.38)'}}>
              ????????????????????????????????????????????????????????????????????????????????????
            </Text>
          </View>
          <View style={{marginTop:verticalScale(32),paddingLeft:scale(16),paddingRight:scale(16),flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{fontSize:moderateScale(16)}}>????????????</Text>
            <Text style={{fontSize:moderateScale(16),color:'#EF6C00'}} onPress={()=>navigation.navigate('selectDepartment')}>??????</Text>
          </View>
          <View style={{marginTop:verticalScale(12),paddingLeft:scale(16),paddingRight:scale(16),flexDirection:'row'}}>
            <Chip mode={'flat'} style={styles.tagChip} textStyle={{color:'#EF6C00', fontSize:moderateScale(14)}}>??????</Chip>
            <Chip mode={'flat'} style={styles.tagChip} textStyle={{color:'#EF6C00', fontSize:moderateScale(14)}}>??????</Chip>
          </View>
          <View style={{marginTop:verticalScale(24),paddingLeft:scale(16),paddingRight:scale(16),flexDirection:'row',flexWrap:'wrap'}}>
            <Text style={{fontSize:moderateScale(16)}}>??????????????????</Text>
          </View>
          <View style={{marginTop:verticalScale(12),paddingLeft:scale(16),paddingRight:scale(16),flexDirection:'row',paddingBottom:verticalScale(28),flexWrap:'wrap'}}>
            <Chip mode={'flat'} style={styles.tagChip} textStyle={{color:'#EF6C00', fontSize:moderateScale(14)}}>??????</Chip>
            <Chip mode={'flat'} style={styles.tagChip} textStyle={{color:'#EF6C00', fontSize:moderateScale(14)}}>??????</Chip>
          </View>
        </Modal>
      </Portal>
      <Portal>
        <Modal visible={seefiltermodal} onDismiss={()=>setSeefiltermodal(false)} contentContainerStyle={styles.dotsmodal}> 
          <View style={{paddingLeft:scale(16), paddingRight:scale(16)}}>
            <Text style={{fontSize:moderateScale(24), paddingTop:verticalScale(16)}}>????????????</Text>
            <Text style={{fontSize:moderateScale(14), paddingTop:verticalScale(4), color:'rgba(0,0,0,0.38)'}}>
              { filter_time == null && filter_place == null && "?????????????????????" }
              { filter_time == null && filter_place != null && filter_place }
              { filter_time != null && filter_place == null && filter_time }
              { filter_time != null && filter_place != null && filter_time+"???"+filter_place }                            
            </Text>
          </View>
          <View style={{marginTop:verticalScale(32),paddingLeft:scale(16),paddingRight:scale(16),flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{fontSize:moderateScale(16)}}>????????????</Text>
            <Text style={{fontSize:moderateScale(16),color:'rgba(0,0,0,0.6)'}} onPress={()=>{resetTimeFilter()}}>??????</Text>
          </View>
          <View style={{marginTop:verticalScale(12),paddingLeft:scale(16),paddingRight:scale(100),flexDirection:'row',flexWrap:'wrap'}}>
            <Chip mode={'outlined'} style={filter_time=="??????"?styles.selectedchip:styles.not_selectedchip} 
                  textStyle={filter_time=="??????"?styles.selectedText:styles.not_selectedText} onPress={()=>handle_time("??????")}>??????</Chip>
            <Chip mode={'outlined'} style={filter_time=="??????"?styles.selectedchip:styles.not_selectedchip} 
                  textStyle={filter_time=="??????"?styles.selectedText:styles.not_selectedText} onPress={()=>handle_time("??????")}>??????</Chip>
            <Chip mode={'outlined'} style={filter_time=="??????"?styles.selectedchip:styles.not_selectedchip} 
                  textStyle={filter_time=="??????"?styles.selectedText:styles.not_selectedText} onPress={()=>handle_time("??????")}>??????</Chip>
            <Chip mode={'outlined'} style={filter_time=="??????????????????"?styles.selectedchip:styles.not_selectedchip} 
                  textStyle={filter_time=="??????????????????"?styles.selectedText:styles.not_selectedText} onPress={()=>{handle_time("??????????????????"); setOpen(true);}}>{formatCustomDate()}</Chip>
          </View>
          <View style={{marginTop:verticalScale(16),paddingLeft:scale(16),paddingRight:scale(16),flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{fontSize:moderateScale(16)}}>????????????</Text>
            <Text style={{fontSize:moderateScale(16),color:'rgba(0,0,0,0.6)'}} onPress={()=>{setFilter_place(null);}}>??????</Text>
          </View>
          <View style={{marginTop:verticalScale(12),paddingLeft:scale(16),paddingRight:scale(16),flexDirection:'row',paddingBottom:verticalScale(28)}}>
            <Chip mode={'outlined'} style={filter_place=="??????"?styles.selectedchip:styles.not_selectedchip} 
                  textStyle={filter_place=="??????"?styles.selectedText:styles.not_selectedText} onPress={()=>handle_place("??????")}>??????</Chip>
            <Chip mode={'outlined'} style={filter_place=="??????"?styles.selectedchip:styles.not_selectedchip} 
                  textStyle={filter_place=="??????"?styles.selectedText:styles.not_selectedText} onPress={()=>handle_place("??????")}>??????</Chip>
            <Chip mode={'outlined'} style={filter_place=="??????"?styles.selectedchip:styles.not_selectedchip} 
                  textStyle={filter_place=="??????"?styles.selectedText:styles.not_selectedText} onPress={()=>handle_place("??????")}>??????</Chip>
            <Chip mode={'outlined'} style={filter_place=="??????"?styles.selectedchip:styles.not_selectedchip} 
                  textStyle={filter_place=="??????"?styles.selectedText:styles.not_selectedText} onPress={()=>handle_place("??????")}>??????</Chip>
          </View>
        </Modal>
      </Portal>
      <StatusBar style="auto" translucent={false}/>
    </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header:{
    width: scale(360),
    height: verticalScale(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  searchbar:{
    paddingLeft: scale(5),
    width: scale(280),
    height: verticalScale(48),
    backgroundColor: '#fff',
    borderRadius: 0,
    elevation: 0
  },
  chipScrollView:{
    height: verticalScale(48),
    alignItems: 'center',
    paddingLeft: scale(16),
    flexDirection: 'row',
    marginBottom: verticalScale(0),
    paddingRight: scale(16)
  },
  selectedchip:{
    borderColor: 'rgba(0,0,0,0.87)',
    backgroundColor: 'rgba(0,0,0,0.87)',
    borderRadius: 36,
    marginRight: scale(8),
    marginBottom: verticalScale(8)
  },
  not_selectedchip:{
    borderColor: 'rgba(0,0,0,0.6)',
    backgroundColor: '#fff',
    borderRadius: 36,
    borderWidth: 1,
    marginRight: scale(8),
    marginBottom: verticalScale(8)
  },
  selectedText:{
    color: '#fff',
    fontSize: moderateScale(16)
  },
  not_selectedText:{
    color: 'rgba(0,0,0,0.6)',
    fontSize: moderateScale(16)
  },
  listitem:{    
    height: verticalScale(252),
    width: scale(328),
    elevation:4,
    borderRadius:4
  },
  itemtitle:{
    color:'#FAFAFA',
    fontSize:moderateScale(24),
    lineHeight: moderateScale(32),
    fontWeight:'500'
  },
  itemtime:{
    color:'rgba(250, 250, 250, 0.83)', 
    fontSize:moderateScale(14),
    fontWeight:'500'
    //marginTop: verticalScale(4)
  },
  item_container:{
    width:'100%', 
    height:verticalScale(252), 
    marginBottom:verticalScale(8), 
    flexDirection:'row', 
    justifyContent:'center'
  },
  dotsmodal:{
    //height:verticalScale(344),
    position:'absolute',
    bottom:verticalScale(60),
    width:'100%',
    backgroundColor:'#fff'
  },
  tagChip:{
    backgroundColor:'rgba(239, 108, 0, 0.16)', 
    borderRadius: 16,
    marginRight: scale(8),
  }
});