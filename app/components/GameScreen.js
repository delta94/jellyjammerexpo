import React, { Component } from "react";
import ReactNative from "react-native";
import { connect } from "react-redux";
import { ActionCreators } from "../actions";
import { bindActionCreators } from "redux";
import SwappableGrid from "../components/SwappableGrid";
import Dimensions from "Dimensions";

import TurnIndicator from "../components/TurnIndicator";
import ImageTypes from "../components/ImageTypes";

import { getJamJarFromBean } from "../components/JamFunctions";
import InstructionalScene from "./InstructionalScene";

var HomeScreen = require("../components/HomeScreen");

const {
  View,
  Text,
  TouchableHighlight,
  Button,
  StyleSheet,
  Image,
  ImageBackground,
  Animated
} = ReactNative;

const InstructionalScenes = [
  ImageTypes.SWIPEINSTRUCTIONS,
  ImageTypes.BEANINSTRUCTIONS,
  ImageTypes.JARINSTRUCTIONS
];

let floatingClouds = require("../assets/FloatingClouds.png");
let justClouds = require("../assets/CloudsBackground.png");
let RedJam = require("../assets/RedJam.png");
let tuffysCartoonHead = require("../assets/TuffyTile.png");
let rowOfJam = require("../assets/JarsOfJam.png");

class GameScreen extends Component {
  constructor(props) {
    super(props);

    this.instructionsCompleted = false;
    this.tuffysHeadHeight = 50;
    this.topMargin = 1.5 * TILE_WIDTH + windowHeight / 2 - 4 * TILE_WIDTH;

    this.gameOver = false;

    this.state = {
      tuffysHeadScale: new Animated.Value(1),
      gameModalScale: new Animated.Value(1),
      modalIndex: 0,
      restart: false,
      tuffysHeadLocation: new Animated.ValueXY(0, 0),
      gameModalLocation: new Animated.ValueXY(0, 0),
      numberOfMoves: 25,
      jamScore: 0,
      totalScore: 0,
      beanScore: 0,
      turnScale: new Animated.Value(1),
      instructionsIndex: 0
    };
  }

  animateTuffysHead() {
    Animated.sequence([
      Animated.delay(100),
      Animated.spring(this.state.tuffysHeadLocation.y, {
        toValue: windowHeight - 2 * TILE_WIDTH,
        friction: 5,
        duration: 1000
      }),
      Animated.timing(this.state.tuffysHeadLocation.y, {
        toValue: windowHeight,
        friction: 10,
        duration: 500
      })
    ]).start();
  }

  endGame() {
    this.gameOver = true;
    this.dropModal();
    this.showTuffy();
  }

  showTuffy() {
    Animated.sequence([
      Animated.delay(100),
      Animated.spring(this.state.tuffysHeadLocation.y, {
        toValue: windowHeight - 2 * TILE_WIDTH,
        friction: 5,
        duration: 1000
      })
    ]).start();
  }

  moveModalTo(yLocation) {
    Animated.sequence([
      Animated.delay(100),
      Animated.spring(this.state.gameModalLocation.y, {
        toValue: yLocation,
        friction: 5,
        duration: 1000
      }),
      Animated.delay(100),
      Animated.spring(this.state.gameModalLocation.x, {
        toValue: 0,
        friction: 5,
        duration: 1000
      })
    ]).start();
  }

  /*
  restartGame() {
    this.hideModal();
    this.setState({ modalIndex: 0 });
    this.setState({ jamScore: 0 });
    this.setState({ numberOfMoves: 25 });
    this.setState({ totalScore: 0 });
    this.animateTuffysHead();

    this.gameOver = false;
  }
  */

  restartGame() {
    const { navigate } = this.props.navigation;
    navigate("Root");
  }

  dropModal() {
    this.moveModalTo(0.5 * TILE_WIDTH);
  }

  hideModal() {
    this.moveModalTo(-7 * TILE_WIDTH);
  }

  incrementTurns(inc) {
    let scale = 1;
    let { numberOfMoves } = this.state;
    numberOfMoves = numberOfMoves + inc;
    this.setState({ numberOfMoves: numberOfMoves });
    if (this.state.numberOfMoves == 0) {
      this.gameOver = true;
      this.endGame();
    }
    if (inc < 0) {
      scale = 0.8;
    } else if (inc > 0) {
      scale = 1.5;
    }

    Animated.sequence([
      Animated.timing(this.state.turnScale, {
        toValue: scale,
        duration: 200
      }),
      Animated.timing(this.state.turnScale, {
        toValue: 1.0,
        duration: 150
      })
    ]).start();
  }

  updateScore(beans, jam) {
    let { beanScore } = this.state;
    let { jamScore } = this.state;

    let inc = 0;

    if (beans != 0) {
      inc = 3 * (beans - 2);
    }

    jamScore = jamScore + 3 * jam;
    beanScore = beanScore + inc;
    totalScore = jamScore + beanScore;

    this.setState({ beanScore: beanScore });
    this.setState({ jamScore: jamScore });
    this.setState({ totalScore: totalScore });

    console.log(this.props.screenProps.incrementRedJellyBean());
    console.log(this.props.screenProps.redBeanCount);
  }

  componentWillMount() {
    this.state.tuffysHeadLocation.setValue({
      x: 0,
      y: windowHeight
    });
    this.state.gameModalLocation.setValue({
      x: 0,
      y: -7 * TILE_WIDTH
    });

    this.dropModal();
  }

  justPlayGame() {
    this.instructionsCompleted = true;
    this.hideModal();
  }

  gameModalContent(i) {
    const { navigate } = this.props.navigation;

    if (i == InstructionalScenes.length) {
      this.hideModal();
    }

    if (this.instructionsCompleted == false) {
      return (
        <View style={styles.gameModalContainer}>
          <Image
            style={styles.gameModalImage}
            source={InstructionalScenes[i]} //NOTE: Array and indexes go here
          />
          <View style={styles.modalButtonsRow}>
            <TouchableHighlight
              onPress={this.justPlayGame.bind(this)}
              style={styles.justPlayButton}
            >
              <Text style={styles.modalButtonText}>{"Start"}</Text>
            </TouchableHighlight>
            <TouchableHighlight
              style={styles.nextButton}
              onPress={this.nextInstructions.bind(this)}
            >
              <Text style={styles.modalButtonText}>Next Hint</Text>
            </TouchableHighlight>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.finalScoreModal}>
          <Text style={styles.scoreText}>{this.state.totalScore} Points</Text>
          <View style={styles.modalButtonsRow}>
            <TouchableHighlight
              onPress={this.restartGame.bind(this)}
              style={styles.justPlayButton}
            >
              <Text style={styles.modalButtonText}>{"Play Again"}</Text>
            </TouchableHighlight>
          </View>
        </View>
      );
    }
  }

  nextInstructions() {
    if (this.state.modalIndex == InstructionalScenes.length) {
      this.instructionsCompleted = true;
      this.hideModal();
    } else {
      Animated.sequence([
        Animated.timing(this.state.gameModalScale, {
          toValue: 1.1,
          duration: 150,
          decay: 1
        }),
        Animated.timing(this.state.gameModalScale, {
          toValue: 1,
          duration: 150,
          decay: 4
        })
      ]).start();

      this.setState({ modalIndex: this.state.modalIndex + 1 });
    }

    console.log("nextInstructions Clicked");
  }

  render() {
    const { navigate } = this.props.navigation;

    let [translateX, translateY] = [
      this.state.tuffysHeadLocation.x,
      this.state.tuffysHeadLocation.y
    ];

    let scale = this.state.tuffysHeadScale;

    let backButton = (
      <TouchableHighlight
        style={styles.backButton}
        onPress={() => navigate("Root")}
      >
        <Image style={styles.backButtonImage} source={ImageTypes.BACKARROW} />
      </TouchableHighlight>
    );

    let topOfTuffyComponent = (
      <Animated.View
        style={[
          styles.tuffysHeadContainer,
          { transform: [{ translateX }, { translateY }, { scale }] }
        ]}
      >
        <Image style={styles.tuffysHead} source={ImageTypes.TOPOFTUFFYSHEAD} />
      </Animated.View>
    );

    [translateX, translateY] = [
      this.state.gameModalLocation.x,
      this.state.gameModalLocation.y
    ];

    scale = this.state.gameModalScale;

    let gameModal = (
      <Animated.View
        style={[
          styles.gameOverModal,
          { transform: [{ translateX }, { translateY }, { scale }] }
        ]}
      >
        {this.gameModalContent(this.state.modalIndex)}
      </Animated.View>
    );

    // TODO: D.R.Y.
    const descriptor = gameOver => {
      if (!gameOver) {
        return (
          <View style={styles.topBar}>
            {backButton}
            <Text style={styles.text}>{this.state.totalScore}</Text>
            <TurnIndicator
              scale={this.state.turnScale}
              text={this.state.numberOfMoves}
            />
          </View>
        );
      } else {
        return (
          <View style={styles.topBar}>
            {backButton}
            <Text style={styles.text}>""</Text>
            <TurnIndicator scale={this.state.turnScale} text={""} />
          </View>
        );
      }
    };

    return (
      <ImageBackground source={justClouds} style={styles.backGroundImage}>
        {descriptor(this.gameOver)}
        <View style={styles.gridContainer}>
          <SwappableGrid
            gameOver={this.gameOver}
            topMargin={this.topMargin}
            animateTuffysHead={this.animateTuffysHead.bind(this)}
            updateScore={this.updateScore.bind(this)}
            incrementTurns={this.incrementTurns.bind(this)}
          />
        </View>
        {topOfTuffyComponent}
        {gameModal}
      </ImageBackground>
    );
  }
}

let Window = Dimensions.get("window");
let windowSpan = Math.min(Window.width, Window.height);
let colored = true;
let TILE_WIDTH = windowSpan / 6;

let windowWidth = Window.width;
let windowHeight = Window.height;

let blue = colored ? "#3c44d8" : "#ffffff";
let red = colored ? "#f24646" : "#ffffff";
let yellow = colored ? "#faff7f" : "#ffffff";
let green = colored ? "#168e3a" : "#ffffff";
let orange = colored ? "#ea0e62" : "#ffffff";
let pink = colored ? "#ff51f3" : "#ffffff";
let white = "#ffffff";

let styles = StyleSheet.create({
  gameModalContainer: {
    flex: 1,
    flexDirection: "col",
    justifyContent: "center",
    width: 6 * TILE_WIDTH,
    height: 6 * TILE_WIDTH
  },

  gameModalImage: {
    width: 6 * TILE_WIDTH,
    height: 6 * TILE_WIDTH,
    borderRadius: TILE_WIDTH / 2
  },
  modalButtonsRow: {
    flexDirection: "row",
    flex: 1
  },
  backButton: {
    flex: 1,
    height: TILE_WIDTH,
    justifyContent: "center"
  },
  backButtonImage: {
    height: 0.5 * TILE_WIDTH,
    width: 0.5 * TILE_WIDTH
  },
  turnIndicator: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  backGroundImage: {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center"
  },
  topBarAndGridContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center"
    //backgroundColor: pink
  },
  bottomBar: {
    alignItems: "center"
    //backgroundColor: "grey"
  },
  gridContainer: {
    height: 5 * TILE_WIDTH,
    width: 5 * TILE_WIDTH,
    alignItems: "center",
    marginTop: windowHeight / 2 - 4 * TILE_WIDTH
    //backgroundColor: blue
  },
  topBar: {
    marginTop: TILE_WIDTH / 2,
    height: TILE_WIDTH,
    flexDirection: "row",
    justifyContent: "center"
    //backgroundColor: yellow
  },
  text: {
    flex: 4,
    //backgroundColor: "#ff51f3",
    textAlign: "center",
    fontFamily: "ChalkboardSE-Regular",
    fontSize: TILE_WIDTH / 1.5,
    alignItems: "center"
    //backgroundColor: "blue"
    //color       : '#fff'
  },
  scoreText: {
    flex: 1,
    backgroundColor: "#ff51f3",
    textAlign: "center",
    fontFamily: "ChalkboardSE-Regular",
    fontSize: TILE_WIDTH / 1.5,
    alignItems: "center"
  },
  backArrow: {
    //fontSize: 50
    //fontSize: "ChalkBoard SE"
  },
  leaveGameButton: {
    width: TILE_WIDTH,
    height: TILE_WIDTH / 2
  },
  scoreText: {
    alignItems: "center",
    textAlign: "center",
    fontFamily: "ChalkboardSE-Regular",
    fontSize: TILE_WIDTH / 1.5
  },
  gameOverModal: {
    position: "absolute",
    height: 6 * TILE_WIDTH,
    width: 6 * TILE_WIDTH,
    flexDirection: "column"
  },
  finalScoreModal: {
    height: 2 * TILE_WIDTH,
    backgroundColor: white,
    borderRadius: TILE_WIDTH / 5
  },
  tuffysHeadContainer: {
    position: "absolute",
    height: 2 * TILE_WIDTH,
    width: 3 * TILE_WIDTH
    //backgroundColor: "#c00ffe"
  },
  turnIndicator: {
    flex: 1,
    alignItems: "center"
  },
  tuffysHead: {
    position: "absolute",
    height: 2 * TILE_WIDTH,
    width: 3 * TILE_WIDTH
    //backgroundColor: "#c00ffe"
  },
  nextButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: TILE_WIDTH / 1.5,
    backgroundColor: "#9404ed",
    fontFamily: "ChalkboardSE-Regular",
    borderRadius: TILE_WIDTH / 5
  },
  modalButtonText: {
    fontSize: TILE_WIDTH / 3,
    color: white,

    fontFamily: "ChalkboardSE-Regular"
  },
  justPlayButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: TILE_WIDTH / 1.5,
    backgroundColor: "#ff447c",
    borderRadius: TILE_WIDTH / 5
  }
});

module.exports = GameScreen;
