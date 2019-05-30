export const DefaultCornerButtonStyle = {
  borderStyle: 'solid solid solid solid',
  borderWidth: '1px',
  position: 'absolute',
  width: '8px',
  height: '8px',
  backgroundColor: '#fff'
};

export const CornerButtonList = [
  // {
  //   type: 'UpperLeft',
  //   defaultStyle: {
  //     ...DefaultCornerButtonStyle,
  //     borderColor: '#ccc',
  //     cursor: 'nwse-resize',
  //     top: '0',
  //     left: '0',
  //   },
  // },
  // {
  //   type: 'UpperRight',
  //   defaultStyle: {
  //     ...DefaultCornerButtonStyle,
  //     borderColor: '#ccc',
  //     cursor: 'ne-resize',
  //     top: '0',
  //     right: '0',
  //   },
  // },
  // {
  //   type: 'LowerLeft',
  //   defaultStyle: {
  //     ...DefaultCornerButtonStyle,
  //     borderColor: '#ccc',
  //     cursor: 'ne-resize',
  //     bottom: '0',
  //     left: '0',
  //   },
  // },
  {
    type: 'LowerRight',
    defaultStyle: {
      ...DefaultCornerButtonStyle,
      borderColor: '#ccc',
      cursor: 'nwse-resize',
      bottom: '0',
      right: '0',
    },
  },
];
