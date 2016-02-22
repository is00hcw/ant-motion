import React, { PropTypes } from 'react';
import TweenOne from 'rc-tween-one';
import './page.less';
import { Link } from 'react-router';
import QueueAnim from 'rc-queue-anim';
const listNav = require('./list');

class Page extends React.Component {
  constructor() {
    super(...arguments);
    this.ulOpen = {};
    const list = listNav[this.props._keys] || [];
    this.navHeight = 40;
    this.state = {
      list,
      ulTween: this.getTweenData(this.props, list),
    };
    [
      'liClick',
      'listElement',
      'judgeChildActive',
    ].forEach((method) => this[method] = this[method].bind(this));
  }

  componentWillReceiveProps(nextProps) {
    // 不用 ref, 直接算, list 高度为40, 取个数;
    if (nextProps._keys !== this.props._keys) {
      const list = listNav[nextProps._keys] || [];
      const ulTween = this.getTweenData(nextProps, list);
      this.setState({ list, ulTween });
    }
  }

  getTweenData(props, list) {
    const ulTween = {};// this.state.ulTween;
    list.forEach((item, i) => {
      if (item.children) {
        // 判断当前页面是不是子级; 如果是子级 open 强制设为 true;
        const childActive = this.judgeChildActive(item.children);
        this.ulOpen[props._keys + i] = childActive || item.open;
        if (!this.ulOpen[props._keys + i]) {
          ulTween[props._keys + i] = {
            marginTop: -item.children.length * this.navHeight,
          };
        }
      }
    });
    return ulTween;
  }

  judgeChildActive(child) {
    const href = this.props.href.split('/');
    let active = false;
    child.forEach(item => {
      if (href.indexOf(item.href) >= 0) {
        active = true;
      }
    });
    return active;
  }

  liClick(i, length) {
    const ulTween = this.state.ulTween;
    if (this.ulOpen[i]) {
      ulTween[i] = {
        marginTop: -length * this.navHeight,
      };

      delete this.ulOpen[i];
    } else {
      ulTween[i] = {
        marginTop: 0,
      };
      this.ulOpen[i] = true;
    }
    this.setState({
      ulTween,
    });
  }

  listElement(item, i) {
    function liClick() {
      this.liClick.bind(this, this.props._keys + i, item.children.length);
    }
    const href = this.props.href.split('/');
    let className = '';
    if (item.children) {
      // 返回二级菜单
      const child = item.children.map(this.listElement);
      const open = this.ulOpen[this.props._keys + i] ? 'open' : '';
      if (!this.ulOpen[this.props._keys + i] && this.judgeChildActive(item.children)) {
        className = 'active';
      }

      return (<li key={`${this.props._keys}.${item.href || 'index'}`}
        className={className} disabled={item.disabled}
      >
        <h4
          onClick={liClick}
          className={open}
        >
          {item.title}
          <i>{item.desc}</i>
        </h4>
        <TweenOne animation={this.state.ulTween[this.props._keys + i]}>
          <ul>
            {child}
          </ul>
        </TweenOne>
      </li>);
    }

    const _href = item.href.replace(/[/]/g, '') || 'index';
    className = '';
    if (href.indexOf(_href) >= 0 ||
      ((_href === 'index' || _href === '' || _href === '/') &&
      (href[2] === '' || !href[2]))) {
      className = 'active';
    }
    return (<li key={`${this.props._keys}.${_href}`}
      className={className} disabled={item.disabled}
    >
      <Link to={`/${this.props._keys}/${item.href}`}>
        {item.title}
        <i>{item.desc}</i>
      </Link>
    </li>);
  }

  render() {
    const list = this.state.list.map(this.listElement);
    return (<div className={this.props.className}>
      <div className={`${this.props.className}-wrapper`}>
        <aside>
          <QueueAnim type={['bottom', 'top']} duration={450}>
            <QueueAnim key={this.props._keys} component="ul" type="bottom">{list}</QueueAnim>
          </QueueAnim>
        </aside>
        <section>
          <QueueAnim type={['right', 'left']} duration={450}
            className={`${this.props.className}-content`}
          >
            <div key={this.props.href}>{this.props.children}</div>
          </QueueAnim>
        </section>
      </div>
    </div>);
  }
}
Page.propTypes = {
  className: PropTypes.string,
  list: PropTypes.array,
  href: PropTypes.string,
  _keys: PropTypes.string,
  content: PropTypes.object,
  children: PropTypes.any,
};

Page.defaultProps = {
  className: 'page',
  language: '',
};
export default Page;
