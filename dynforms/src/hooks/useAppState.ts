import _ from 'lodash';

import { useState, useEffect } from "react";

let state = {};

// let's store the functions to update the state for each interested component
// this is an array of setCounter's function pointers.
let listeners: any = [];

const useAppState = () => {
  // we're not interested in using the counter state, just setState
  const setState = useState(state)[1];

  const updateState = (stateObject: any) => {
    state = _.cloneDeep(stateObject);
    console.log('Updating global state to ', state)
    for (const listener of listeners) {
      listener(state);
    }
  };

  // let's register the components when they call this hook for the first time by
  // pushing their corresponding setState function into the listeners array
  useEffect(() => {
    //when the component did mount, its corresponding setCounter function is added to the list, as a pointer
    listeners.push(setState);

    //There's an unmounting clean up function (which is a closure), that de-registers the component from the listeners
    return () => {
      listeners = listeners.filter((li: any) => li !== setState);
    };
  }, [setState]);

  // let's return the global state and a way to update it
  return [state, updateState];
};

export default useAppState;
