import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  and,
  block,
  Clock,
  clockRunning,
  cond,
  EasingNode,
  eq,
  not,
  set,
  startClock,
  stopClock,
  timing,
  useCode,
  Value,
} from "react-native-reanimated";
import { useClock, useValue } from "react-native-redash";
import ChatBubble from "./ChatBubble";
import { Button, StyleGuide } from "../components";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: StyleGuide.palette.background,
  },
});

const runTiming = (clock: Clock) => {
  const state = {
    finished: new Value(0),
    position: new Value(0),
    frameTime: new Value(0),
    time: new Value(0),
  };
  const config = {
    toValue: new Value(1),
    duration: 3000,
    easing: EasingNode.inOut(EasingNode.ease),
  };
  //[ ? this return block is executed every frame ? ]
  return block([
    cond(
      not(clockRunning(clock)),
      set(state.time, 0),
      timing(clock, state, config)
    ),
    cond(eq(state.finished, 1), [
      set(state.finished, 0),
      set(state.frameTime, 0),
      set(state.time, 0),
      set(config.toValue, not(state.position)),
    ]),
    state.position,
  ]);
};

const Timing = () => {
  const [play, setPlay] = useState(false);
  //play state와 값이 매치되는 애니메이션 밸류를 만든다. (play가 true면, 애니메이션 밸류는 1, play가 false면, 애니메이션 밸류는 0)
  const isPlaying = useValue(0);
  useCode(() => [set(isPlaying, play ? 1 : 0)], [play]);

  const clock = useClock();
  //useValue 는 애니메이션밸류이다
  const progress = useValue(0);
  //declare animation nodes to be run for every frame on the UI thread
  //[ ? this useCode block is executed every frame ? ]
  useCode(
    () => [
      cond(and(isPlaying, not(clockRunning(clock))), startClock(clock)),
      cond(and(not(isPlaying), clockRunning(clock)), stopClock(clock)),
      set(progress, runTiming(clock)),
    ],
    []
  );
  return (
    <View style={styles.container}>
      <ChatBubble {...{ progress }} />
      <Button
        label={play ? "Pause" : "Play"}
        primary
        onPress={() => setPlay((prev) => !prev)}
      />
    </View>
  );
};

export default Timing;
