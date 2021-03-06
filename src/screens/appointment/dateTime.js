import React, { Component } from 'react';
import { Container, Header, Content, Text, Body, Left, Title, Icon, Right, Button } from 'native-base';
import {ListView, View} from "react-native";
import DatePicker from 'react-native-datepicker';
import firebase from 'firebase';
import styles from "./styles";

const rows = [
  { id: 1, text: "10:00",disabled:false },
  { id: 2, text: "10:30",disabled:false },
  { id: 3, text: "11:00",disabled:false },
  { id: 4, text: "11:30",disabled:false },
  { id: 5, text: "12:00",disabled:false },
  { id: 6, text: "12:30",disabled:false },
  { id: 7, text: "13:00",disabled:false },
  { id: 8, text: "13:30",disabled:false },
  { id: 9, text: "14:00",disabled:false },
  { id: 10, text: "14:30",disabled:false},
  { id: 11, text: "15:00",disabled:false},
  { id: 12, text: "15:30",disabled:false},
  { id: 13, text: "16:00",disabled:false},
  { id: 14, text: "16:30",disabled:false},
  { id: 15, text: "17:00",disabled:false},
  { id: 16, text: "17:30",disabled:false},
  { id: 17, text: "18:00",disabled:false},
  { id: 18, text: "18:30",disabled:false},
  { id: 19, text: "19:00",disabled:false},
  { id: 20, text: "19:30",disabled:false},
  { id: 21, text: "20:00",disabled:false},
  { id: 22, text: "20:30",disabled:false},
  { id: 23, text: "21:00",disabled:false},
  { id: 24, text: "21:30",disabled:false},
];

let dateFormat = require('dateformat');

export default class DateTime extends Component {
  constructor(props){
    super(props);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    let tarih=new Date();
    this.state = {
      date: '',
      time: '20:00',
      datetime: dateFormat(new Date(),"dd/mm/yyyy") ,
      selectTime:null,
      disabledValue:true
    }
    this.changeDate();
  }

  Time() {
    return rows.map((news, i)=>{
      return(
        <View key={i} style={styles.subStyle}>
         <Button rounded success  style={{paddingLeft:30,paddingRight:30,width:140 }} disabled={news.disabled}  onPress={(selectTime)=>this.setState({selectTime: news.text})}>
           <View style={{alignItems:'center',justifyContent:'center'}}>
            <Text style={{fontSize:15}}>{news.text}</Text>
           </View> 
         </Button>
       </View>
      );
    });
  }

  saveAppoinment(data,ownerId){
      const{selectTime,datetime}=this.state;
      let userId=firebase.auth().currentUser.uid;

      firebase.database().ref('reservations/').push({
          selectTime: selectTime,
          datetime: datetime,
          ownerPhone: data.phone,
          customer_id: userId,
          employee_id: data.key,
      }).then(response=>this.saveReservationBerber(response.key,data,ownerId));
      //this.saveReservationBerber(data);
  }

  saveReservationBerber(key,data,ownerId){
    const{selectTime,datetime}=this.state;
    if (ownerId!==data.key) {
        firebase.database().ref('berbers/'+ownerId+'/'+data.key+'/'+'reservationId/'+key).set({
        time:selectTime,
        date:datetime
      });
    }
    else if(ownerId===data.key){
        firebase.database().ref('berbers/'+ownerId+'/reservationId/'+key).set({
        time:selectTime,
        date:datetime
      });
    }
    this.props.navigation.navigate('Reservations')
  }

  changeDate(){   
    for(let row of rows){
      row.disabled=false;
    }    
    const {data,ownerId} = this.props.navigation.state.params;  
    let leadsRef = '';
    
    if (data.key!== ownerId) {

      leadsRef = firebase.database().ref('berbers/'+ownerId+'/'+data.key+'/reservationId/');

    }else {
      
      leadsRef = firebase.database().ref('berbers/'+ownerId+'/reservationId/');

    }

    leadsRef.on('value', (snapshot)=> {
        snapshot.forEach((childSnapshot)=> {
          if (childSnapshot.val().date === this.state.datetime) {
            for(let row of rows){
              if(childSnapshot.val().time === row.text){
                row.disabled=true;
              }
            }
          }
        });
    });
  }
  
  disabled(){
    for (let row of rows) {
      row.disabled=false;
    }
    this.props.navigation.navigate('Appointment');
  }

  render() {
    const {data,ownerId} = this.props.navigation.state.params;

    return (
      <Container>
        <Header>
          <Left>
            <Button  transparent
              onPress={() => this.disabled()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>Randevu Oluştur</Title>
          </Body>
          <Right />
        </Header>
        <Content>
         <View style={styles.container}>
          <View style={styles.subStyle}>
            <DatePicker
              style={{width: 300}}
              date={this.state.datetime}
              mode="date"
              placeholder="placeholder"
              format="DD/MM/YYYY"
              minDate="2018-05-01"
              maxDate="2020-06-01"
              confirmBtnText="Confirm"
              btnConfirm={this.changeDate()}
              cancelBtnText="Cancel"
              onDateChange={(date) => this.setState({datetime:date})}
            />
          </View>
          <View style={styles.subStyle}>
              {this.Time()}
          </View>
         </View>
        </Content>
        <Button block style={styles.btnWorker} onPress={()=>this.saveAppoinment(data,ownerId)}>
            <Text>Randevu Ekle</Text>
        </Button>
      </Container>
    );
  }
}
