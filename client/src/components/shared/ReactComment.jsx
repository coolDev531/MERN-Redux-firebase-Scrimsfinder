import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class ReactComment extends Component {
  static defaultProps = {
    trim: true,
  };

  componentDidMount() {
    //  can only use findDOMNode in class components
    let el = ReactDOM.findDOMNode(this);
    ReactDOM.unmountComponentAtNode(el);
    el.outerHTML = this.createComment();
  }

  createComment() {
    let text = this.props.text;

    if (this.props.trim) {
      text = text.trim();
    }

    return `<!-- ${text} -->`;
  }

  render() {
    return <div />;
  }
}

export default ReactComment;
