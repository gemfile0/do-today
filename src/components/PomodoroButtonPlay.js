/* @flow */

import React, { Component } from 'react';
import { View, Animated, Easing } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { startPomodoro, stopPomodoro, getPomodoro } from 'actions';
import { MKButton } from 'react-native-material-kit';
import { Color, ImageView, Style } from './common';
import PlayImage from './img/play.png';
import CompleteImage from './img/tomato.png';

const PlainFab = MKButton.plainFab().withBackgroundColor(Color.Red).build();

class PomodoroButtonPlay extends Component {
  props: {
    startPomodoro: (todo: Object, minutesAtATime: number) => Object,
    stopPomodoro: (todo: Object) => Object,
    getPomodoro: (todo: Object) => Object,
    currentTodo: Object,
    minutesAtATime: number
  }
  aniCount: number;

  state = {
    bounceValue: new Animated.Value(1),
    renderingIcon: '',
    isAnimating: false,
  };
  aniCount = 0;

  componentWillReceiveProps(nextProps) {
    const { currentTodo } = this.props;
    const { currentTodo: nextTodo } = nextProps;
    const { bounceValue } = this.state;

    const needUpdate =
      ( !currentTodo && nextTodo ) ||
      currentTodo &&
      nextTodo &&
      ( currentTodo.pomodoro.nextState !== nextTodo.pomodoro.nextState ||
        currentTodo.id !== nextTodo.id );

    if (needUpdate) {
      if (this.aniCount === 0) {
        this.setState({ isAnimating: true });
      }
      this.aniCount++;
      bounceValue.setValue(1);
      Animated.timing(bounceValue, {
        toValue: 0,
        easing: Easing.quad,
        duration: 100
      }).start( () => {
        this.setState({ renderingIcon: nextTodo.pomodoro.nextState });
        Animated.timing(bounceValue, {
          toValue: 1,
          easing: Easing.elastic(1), // Springy
          duration: 295
        }).start( () => {
          this.aniCount--;
          if (this.aniCount === 0) {
            this.setState({ isAnimating: false })
          }
        });
      });
    }
  }

  onPress() {
    const {
      startPomodoro,
      stopPomodoro,
      getPomodoro,
      currentTodo
    } = this.props;

    if (currentTodo) {
      switch (currentTodo.pomodoro.nextState) {
        case 'start':
        return startPomodoro(currentTodo, this.props.minutesAtATime);

        case 'stop':
        return stopPomodoro(currentTodo);

        case 'get':
        return getPomodoro(currentTodo);
      }
    }
  }


  renderIcon(renderingIcon) {
    const { playImageStyle, stopImageStyle, getImageStyle } = styles;
    switch (renderingIcon) {
      case 'start':
      return <ImageView imageSource={PlayImage} imageStyle={playImageStyle} />

      case 'stop':
      return <View style={stopImageStyle} />

      case 'get':
      return <ImageView imageSource={CompleteImage} imageStyle={getImageStyle} />
    }
  }

  render() {
    const { buttonStyle, animationStyle } = styles;
    const { renderingIcon } = this.state;

    const buttonOpacity = this.state.isAnimating ? 0 : 1;
    const animationOpacity = this.state.isAnimating ? 1 : 0;
    return (
      <View>
        <Animated.View
          style={[
            animationStyle,
            {
              transform: [{ scale: this.state.bounceValue }],
              opacity: animationOpacity
            }
          ]}
        >
          { this.renderIcon(renderingIcon) }
        </Animated.View>
        <PlainFab
          style={[
            buttonStyle,
            {
              opacity: buttonOpacity
            }
          ]}
          onPress={this.onPress.bind(this)}
        >
          { this.renderIcon(renderingIcon) }
        </PlainFab>
      </View>
    );
  }
}

const styles = {
  buttonStyle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Style.shadowStyle
  },
  animationStyle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    backgroundColor: Color.Red,
    ...Style.shadowStyle
  },
  playImageStyle: {
    tintColor: Color.White,
    marginLeft: 3
  },
  stopImageStyle: {
    backgroundColor: Color.White,
    width: 16,
    height: 16
  },
  getImageStyle: {
    tintColor: Color.White,
    marginBottom: 2,
    width: 26,
    height: 26
  }
};

const mapStateToProps = ({ todosState }) => {
  return {
    currentTodo: todosState.get('currentTodo'),
    minutesAtATime: todosState.get('minutesAtATime')
  };
};

const mapDispatchToProps = dispatch => bindActionCreators({
  startPomodoro,
  stopPomodoro,
  getPomodoro,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PomodoroButtonPlay);
