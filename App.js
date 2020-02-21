import React, { Component } from 'react';
import { StyleSheet, Text, View, StatusBar, TextInput, Dimensions, Platform, ScrollView, SafeAreaView, AsyncStorage } from 'react-native';
import ToDo from "./ToDo";
import { AppLoading } from "expo";
import uuidv1 from "uuid/v1";

const {height, width} = Dimensions.get("window");

export default class App extends React.Component{
  state = {
    newToDo: "",
    loadedToDos: false,
    toDos: {}
  };

  componentDidMount = () => {
    this._loadedToDos();
  }
  
  render(){
    const {newToDo, loadedToDos, toDos} = this.state;

    if(!loadedToDos){
      return <AppLoading />;
    }

    return(
      <View style={styles.container}>
      <StatusBar barStyle="light-content"/>
      <Text style={styles.title}>My TO Do</Text>
      <View style={styles.card}>
        <TextInput style={styles.input} placeholder={"new to do"} 
                    value={newToDo} onChangeText={this._controlNewToDo}
                    placeholderTextColor={"#999"} returnKeyType={"done"} autoCorrect={false}
                    onSubmitEditing={this._loadedToDo}
                    underlineColorAndroid={"transparent"}/> // underlineColorAndroid-> edittext에서 밑줄 안나오게..
        <ScrollView contentContainerStyle={styles.todos}> 
          {
            Object.values(toDos)
            .reverse() // list 역순
            .map(toDo => 
              <ToDo key={toDo.id} 
                    deleteToDo={this._deleteToDo}
                    completedToDo={this._completedToDo}
                    unCompletedToDo={this._unCompletedToDo}
                    updateToDo={this._updateToDo}
                    {...toDo} />
            )
          }
        </ScrollView>       
      </View>
    </View>
    )
  }
  _controlNewToDo = (text) => {
    this.setState({
      newToDo: text
    });
  }

  _loadedToDos = async () => {
    try{
      const toDos = await AsyncStorage.getItem("toDos"); // async -> await
      const parsedToDos = JSON.parse(toDos);
      this.setState({
        loadedToDos: true,
        toDos: parsedToDos || {}
      });
    }catch(err){
      console.log(err);
    }
  }

  _loadedToDo = () => {
    const {newToDo} = this.state
    if(newToDo !== ""){
      this.setState(prevState => {
        const ID = uuidv1();
        const newToDoObj = {
          [ID]: {
            id: ID, 
            isCompleted: false,
            text: newToDo,
            createdAt: Date.now()
          }
        };
        const newState = {
          ...prevState, 
          newToDo: "",
          toDos: {
            ...prevState.toDos, 
            ...newToDoObj
          }
        };
        this._saveToDos(newState.toDos);
        return { ...newState };
      });
    }
  }

  _deleteToDo = (id) => {
    this.setState(prevState => {
      const toDos = prevState.toDos;
      delete toDos[id];
      const newState = {
        ...prevState, 
        ...toDos
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  }

  _unCompletedToDo = (id) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos, 
          [id]: {
            ...prevState.toDos[id],
            isCompleted: false
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  }

  _completedToDo = (id) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos, 
          [id]: {
            ...prevState.toDos[id],
            isCompleted: true
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  }

  _updateToDo = (id, text) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos, 
          [id]: {
            ...prevState.toDos[id],
            text: text
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  }

  _saveToDos = (newToDos) => {
    console.log(JSON.stringify(newToDos))
    // AsyncStorage : object가 아닌 stirng 저장용 로컬스토리지
    const saveToDos = AsyncStorage.setItem("toDos", JSON.stringify(newToDos));
  }

}

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content"/>
//       <Text style={styles.title}>My TO Do</Text>
//       <View style={styles.card}>
//         <TextInput style={styles.input} placeholder={"new to do"} 
//                     value={newToDo} onChangeText={_controlNewToDo}
//                     placeholderTextColor={"#999"} returnKeyType={"done"} autoCorrect={false}/>
//         <ScrollView contentContainerStyle={styles.todos}> 
//           <ToDo text={"hello,world"}/>
//         </ScrollView>       
//       </View>
//     </View>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f23657',
    alignItems: 'center',
    // justifyContent: 'center',
  },
  title: {
    color: "white",
    fontSize: 25,
    fontWeight: "200",
    marginTop: 40,
    marginBottom: 30
  },
  card: {
    backgroundColor: "white",
    flex: 1,
    width: width - 25,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "rgb(50,50,50)",
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowOffset: {
          height: -1, 
          width: 0
        }
      },
      android: {
        elevation: 5
      }
    })
  },
  input: {
    padding: 20, 
    borderBottomWidth: 1,
    borderBottomColor: "#bbb",
    fontSize: 20
  },
  todos:{
    alignItems: 'center'
  }
});
