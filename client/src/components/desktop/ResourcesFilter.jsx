import React, { useCallback } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Radio } from 'antd';
import PropTypes from 'prop-types';

import ResourceFilterSearch from '../ResourceFilterSearch';

import '../../css/ResourcesFilter.css';

function ResourcesFilter(props) {
  const {
    costs,
    costSelected,
    languages,
    languageSelected,
    locations,
    locationSelected,
    sorts,
    sortSelected,
    setCost,
    setLanguage,
    setLocation,
    setSort,
  } = props;

  const onChange = useCallback(
    (filterName, value) => {
      switch (filterName) {
        case 'Cost':
          setCost(value);
          break;
        case 'Languages Offered':
          setLanguage(value);
          break;
        case 'Location':
          setLocation(value);
          break;
        case 'Sort By':
          setSort(value);
          break;
        default:
      }
    },
    [setCost, setLanguage, setLocation, setSort],
  );

  const radio = useCallback(
    (filterName, filterOptions, value, isSort) => (
      <div className={isSort ? 'radio-container-sort' : 'radio-container'}>
        {!isSort && <h5 className="title-filter">{filterName}</h5>}
        <Radio.Group
          onChange={(target) => onChange(filterName, target.target.value)}
          value={value}
        >
          {filterOptions.map((option) => (
            <Radio className="radio-filter" key={option} value={option}>
              {option}
            </Radio>
          ))}
        </Radio.Group>
      </div>
    ),
    [onChange],
  );

  return (
    <div className="resources-filter">
      <Dropdown
        overlay={radio('Cost', costs, costSelected, false)}
        placement="bottomLeft"
        trigger={['click']}
      >
        <Button className="button">Cost</Button>
      </Dropdown>
      <Dropdown
        overlay={radio('Languages Offered', languages, languageSelected, false)}
        placement="bottomLeft"
        trigger={['click']}
      >
        <Button className="button">Language</Button>
      </Dropdown>
      <Dropdown
        overlay={radio('Location', locations, locationSelected, false)}
        placement="bottomLeft"
        trigger={['click']}
      >
        <Button className="button">Location</Button>
      </Dropdown>
      <div className="searchbar-align-right">
        <ResourceFilterSearch />
      </div>
      <div className="sort-dropdown">
        <Dropdown
          className="dropdown"
          overlay={radio('Sort By', sorts, sortSelected, true)}
          placement="bottomRight"
          trigger={['click']}
        >
          <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
            Sort By <DownOutlined style={{ verticalAlign: '.2em' }} />
          </a>
        </Dropdown>
      </div>
    </div>
  );
}

ResourcesFilter.propTypes = {
  costs: PropTypes.arrayOf(PropTypes.string).isRequired,
  costSelected: PropTypes.string.isRequired,
  languages: PropTypes.arrayOf(PropTypes.string).isRequired,
  languageSelected: PropTypes.string.isRequired,
  locations: PropTypes.arrayOf(PropTypes.string).isRequired,
  locationSelected: PropTypes.string.isRequired,
  sorts: PropTypes.arrayOf(PropTypes.string).isRequired,
  sortSelected: PropTypes.string.isRequired,
  setCost: PropTypes.func.isRequired,
  setLanguage: PropTypes.func.isRequired,
  setLocation: PropTypes.func.isRequired,
  setSort: PropTypes.func.isRequired,
};

export default ResourcesFilter;