import React from 'react';
import {
  Text, View, StyleSheet, Dimensions,
} from 'react-native';
import { TuyaTimerApi } from '../../../sdk'

import Picker from 'react-native-wheel-picker';
import ButtonX from '../../common/ButtonX';

import HeadView from '../../common/HeadView'
import BaseComponent from '../../common/BaseComponent'

import { taskName, dps } from '../../constant'
const { width } = Dimensions.get('window');
const PickerItem = Picker.Item;

const WEEKS = ['S', 'M', 'T', 'W', 'Th', 'F', 'S'];
let hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
let mins = [
  '00',
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
];


const time = ['AM', 'PM'];

export default class SchedulePage extends BaseComponent {
  constructor(props) {
    super(props);

    const s = this.props.navigation.state.params;
    d = s.data;
    const mIndex = this.renderIndex(undefined != d ? d.m : '00', mins);
    const hIndex = this.renderIndex(undefined != d ? d.h : '00', hours);
    this.state = {
      repeat: ['0', '0', '0', '0', '0', '0', '0'],
      Power: 'open',
      h: '00',
      m: '00',
      time: 'AM',
      mIndex,
      hIndex,
      timerId: d.timerId,
      devInfo: s.devInfo,
      devId: s.devInfo.devId,
      isFirst: s.isFirst,
      category: s.category,
      ...d,
    };
  }

  getHours() {
    hours = [];
    for (i = 1; i <= 12; i++) {
      if (i < 10) hours.push({ label: `0${i}` });
      else hours.push({ label: `${i}` });
    }
  }

  getMins() {
    mins = [];
    for (i = 0; i < 60; i++) {
      if (i < 10) mins.push({ label: `0${i}` });
      else mins.push({ label: `${i}` });
    }
  }

  renderIndex(key, valus) {
    for (let i = 0; i < valus.length; i++) {
      if (key == valus[i].label) {
        return i;
      }
    }
    return 0;
  }

  renderHeaderView() {
    return <HeadView
      centerText={'Create Timer'}
      leftOnPress={() => this.props.navigation.pop()}
    />
  }
  renderContent() {
    return (
      <View style={styles.container}>
        <View style={styles.item}>
          <ButtonX text={'cancel'} textStyle={styles.text} onPress={() => this.props.navigation.pop()} />
          <ButtonX text={'save'} textStyle={styles.text} onPress={() => this.save()} />
        </View>
        <View
          style={{
            width,
            height: 220,
            flexDirection: 'row',
          }}
        >
          <Picker
            style={{ width: 100, height: 220 }}
            selectedValue={hours.indexOf(this.state.h)}
            itemStyle={{ color: 'black', fontSize: 20 }}
            onValueChange={(index) => {
              this.setState({
                h: hours[index],
              });
            }}
          >
            {hours.map((value, i) => <PickerItem label={value} value={i} key={value} />)}
          </Picker>
          <Text style={{ fontSize: 18, color: '#868582', alignSelf: 'center' }}>   :    </Text>
          <Picker
            style={{ width: 100, height: 220 }}
            selectedValue={mins.indexOf(this.state.m)}
            itemStyle={{ color: 'black', fontSize: 20 }}
            onValueChange={(index) => {
              this.setState({
                m: mins[index],
              });
            }}
          >
            {mins.map((value, i) => <PickerItem label={value} value={i} key={value} />)}
          </Picker>
          <Picker
            style={{
              width: 100,
              height: 220,
              position: 'absolute',
              right: 0,
              top: 0,
            }}
            selectedValue={time.indexOf(this.state.time)}
            itemStyle={{ color: 'black', fontSize: 20 }}
            onValueChange={(index) => {
              this.setState({
                time: time[index],
              });
            }}
          >
            {time.map((value, i) => <PickerItem label={value} value={i} key={value} />)}
          </Picker>
          <View
            style={{
              width,
              height: 1,
              backgroundColor: '#CAC9C8',
              position: 'absolute',
              top: 92,
            }}
          />
          <View
            style={{
              width,
              height: 1,
              backgroundColor: '#CAC9C8',
              position: 'absolute',
              top: 128,
            }}
          />
        </View>
        <Text style={styles.Repeat}>{'Repeat'}</Text>
        <View style={styles.repeats}>
          {this.state.repeat.map((d, index) => (
            <ButtonX
              key={index}
              text={WEEKS[index]}
              textStyle={d == '1' ? styles.selectText : {}}
              style={d == '1' ? styles.selectStyle : styles.norlmaStyle}
              onPress={() => {
                const re = this.state.repeat;
                re[index] = d == '1' ? '0' : '1';
                this.setState({ repeat: re });
              }}
            />
          ))}
        </View>
      </View>
    );
  }

  getTime() {
    let h = this.state.h;
    const m = this.state.m;
    if (this.state.time == 'PM') {
      if (parseInt(h) == 12) {
        h = '00';
      } else {
        h = parseInt(h) + 12;
      }
    }
    return `${h}:${m}`;
  }

  save() {
    const d = this.getTime();
    const instruct = [];
    instruct.push({ dps, time: d });
    const jsonstr = `${JSON.stringify(instruct)}`;
    if (this.state.isFirst) {
      TuyaTimerApi.addTimerWithTask({
        taskName,
        loops: this.state.repeat.join(''),
        devId: this.state.devInfo.devId,
        dps,
        time: d
      })
        .then(() => {
          this.showToast('创建成功了');
          this.props.navigation.pop();
        })
        .catch((err) => {
          this.showToast(err.toString())
        });
    } else {
      // TuyaTimerApi.updateTimerWithTask({
      //   taskName,
      //   loops: this.state.repeat.join(''),
      //   devId: this.state.devId,
      //   dpId:'',
      //   isOpen: true,
      //   timeId: this.state.timerId,
      //   time:d,
      // })
      //   .then(() => {
      //     this.props.navigation.pop();
      //   })
      //   .catch((err) => {
      //     this.showToast(err.toString())
      //   });
      TuyaTimerApi.updateTimerWithTaskAndInstruct({
        taskName,
        loops: this.state.repeat.join(''),
        devId: this.state.devId,
        timeId: this.state.timerId,
        instruct: jsonstr,
        time: d,
      })
        .then(() => {
          this.props.navigation.pop();
        })
        .catch((err) => {
          this.showToast(err.toString())
        });
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F7F7',
  },
  item: {
    flexDirection: 'row',
    height: 45,
    width: width - 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 24,
  },
  text: {
    color: '#7DB428',
    fontSize: 16,
  },
  repeats: {
    flexDirection: 'row',
    width: width - 16,
    paddingLeft: 24,
    paddingRight: 24,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  Repeat: {
    color: '#868582',
    fontSize: 18,
    alignSelf: 'flex-start',
    paddingLeft: 24,
    paddingRight: 24,
    marginBottom: 24,
  },
  selectText: {
    color: '#7DB428',
  },
  norlmaStyle: {
    width: 27,
    height: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectStyle: {
    width: 27,
    height: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 99,
    borderColor: '#7DB428',
    borderWidth: 1,
  },
});
