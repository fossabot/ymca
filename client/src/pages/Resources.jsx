// @flow

import React, { useCallback, useEffect, useState } from 'react';
import { Layout } from 'antd';
import '../css/Resources.css';
import Loader from 'react-loader-spinner';
import type { Resource } from '../types/models';

import {
  getCategories,
  getResources,
  getResourcesByCategory,
} from '../utils/api';
import { getSavedResources } from '../utils/auth';
import languages from '../data/languages';
import locations from '../data/locations';
import useWindowDimensions from '../utils/mobile';
import { useAuth } from '../utils/use-auth';
import ResourcesBanner from '../components/ResourcesBanner';
import ResourcesFilter from '../components/desktop/ResourcesFilter';
import ResourcesGrid from '../components/ResourcesGrid';
import ResourceCategoryFilter from '../components/ResourceCategoryFilter';
import ResourcesCatMobile from '../components/mobile/ResourcesCatMobile';

const { Sider } = Layout;

type Props = {
  location: { search: string },
  history: {
    pathname: string,
    push: ({
      pathname: string,
      search?: string,
    }) => void,
    search: string,
  },
  saved: boolean,
};

function Resources({
  saved = false,
  history = { pathname: '', search: '', push: () => {} },
  location: locationProp = { search: '' },
}: Props): React$Element<any> {
  const [cost, setCost] = useState('Free - $$$');
  const [language, setLanguage] = useState('All');
  const [location, setLocation] = useState('All');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [sort, setSort] = useState('Name');
  const [loading, setLoading] = useState(false);

  const [openKeys, setOpenKeys] = useState<Array<string>>([]);
  const [categories, setCategories] = useState<{ [string]: Array<string> }>({});
  const [resources, setResources] = useState<Array<Resource>>([]);
  const [filteredResources, setFilteredResources] = useState<Array<Resource>>(
    [],
  );
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());

  const costs = ['Free', 'Free - $', 'Free - $$', 'Free - $$$'];
  const sorts = ['Name', 'Cost'];
  const isMobile = useWindowDimensions()[1];
  const { authed } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await getCategories();
      const newCategories = {};
      if (res != null) {
        res.result.forEach((c) => {
          newCategories[c.name] = c.subcategories;
        });
      }

      setCategories(newCategories);
    };

    fetchCategories();
  }, []);

  function compareNames(current, next) {
    const textCurrent = current.name.toUpperCase();
    const textNext = next.name.toUpperCase();
    const bool = textCurrent > textNext ? 1 : 0;
    return textCurrent < textNext ? -1 : bool;
  }

  function compareCosts(current, next) {
    const costOrder = ['$$$', '$$', '$', 'Free'];
    const costCurrent = current.cost;
    const costNext = next.cost;
    if (costCurrent === costNext) {
      return 0;
    }
    return costOrder.indexOf(costNext) < costOrder.indexOf(costCurrent)
      ? -1
      : 1;
  }

  const getCategorySelectedFromSearch = useCallback(() => {
    const { search } = locationProp;
    if (search === '') {
      return ['All Resources', ''];
    }

    const subcategoryIndex = search.indexOf('&');
    let categorySelected = search.slice(
      search.indexOf('=') + 1,
      subcategoryIndex === -1 ? search.length : subcategoryIndex,
    );
    categorySelected = categorySelected.replace(/%[\d]*/g, ' ');

    let subcategorySelected =
      subcategoryIndex === -1
        ? ''
        : search.slice(search.indexOf('=', subcategoryIndex) + 1);
    subcategorySelected = subcategorySelected.replace(/%[\d]*/g, ' ');

    return [categorySelected, subcategorySelected];
  }, [locationProp]);

  const updateResources = useCallback(async () => {
    const [
      categorySelected,
      subcategorySelected,
    ] = getCategorySelectedFromSearch();

    setLoading(true);

    const newResources =
      categorySelected === 'All Resources'
        ? await getResources()
        : await getResourcesByCategory(categorySelected);

    let localSavedSet = new Set();
    if (authed === true) {
      const json = await getSavedResources();
      localSavedSet = new Set(json.result);
      setSavedSet(localSavedSet);
    }

    if (saved) {
      newResources.result = newResources.result.filter((newResource) =>
        localSavedSet.has(newResource._id),
      );
    }

    newResources.result.sort(compareNames);

    setCategory(categorySelected);
    setFilteredResources(newResources == null ? [] : newResources.result);
    setOpenKeys([categorySelected]);
    setResources(newResources == null ? [] : newResources.result);
    setSubcategory(subcategorySelected);
    setCost('Free - $$$');
    setLanguage('All');
    setLocation('All / Champaign County');
    setSubcategory(subcategorySelected);

    setLoading(false);
  }, [getCategorySelectedFromSearch, saved, authed]);

  const updateSaved = updateResources;

  const updateSort = useCallback(() => {
    switch (sort) {
      case 'Name': {
        const newResources = resources.sort(compareNames);
        setResources(newResources);
        break;
      }
      case 'Cost': {
        const newResources = resources.sort(compareCosts);
        setResources(newResources);
        break;
      }
      default:
    }
  }, [resources, sort]);

  useEffect(() => {
    updateResources();
  }, [locationProp.search, saved, authed, updateResources]);

  useEffect(() => {
    const costMap = {
      Free: ['Free'],
      'Free - $': ['Free', '$'],
      'Free - $$': ['Free', '$', '$$'],
      'Free - $$$': ['Free', '$', '$$', '$$$'],
    };
    updateSort();
    const newFilteredResources = resources.filter(
      (resource) =>
        (resource.subcategory.includes(subcategory) || subcategory === '') &&
        (costMap[cost].includes(resource.cost) || cost === 'Free - $$$') &&
        (resource.availableLanguages?.includes(language) ||
          language === 'All') &&
        (resource.city === location || location === 'All / Champaign County'),
    );

    setFilteredResources(newFilteredResources);
  }, [cost, language, location, subcategory, resources, sort, updateSort]);

  const categorySelectAll = useCallback(() => {
    history.push({
      pathname: '/resources',
    });
  }, [history]);

  const subcategorySelect = useCallback(
    (value: string) => {
      history.push({
        pathname: '/resources',
        search: `?category=${category}&subcategory=${value}`,
      });
    },
    [category, history],
  );

  const onOpenChange = useCallback(
    (newOpenKeys: Array<string>) => {
      if (newOpenKeys.length === 0) {
        if (categories[category].indexOf(subcategory) !== -1) {
          history.push({
            pathname: '/resources',
            search: `?category=${category}`,
          });
          return;
        }
        setOpenKeys([]);
        return;
      }

      const latestOpenKey = newOpenKeys.find(
        (key) => openKeys.indexOf(key) === -1,
      );
      if (Object.keys(categories).indexOf(latestOpenKey) === -1) {
        setOpenKeys(newOpenKeys);
      } else {
        setOpenKeys(latestOpenKey != null ? [latestOpenKey] : []);
      }
      const categorySelected = latestOpenKey;
      history.push({
        pathname: '/resources',
        search: `?category=${categorySelected ?? ''}`,
      });
    },
    [categories, category, openKeys, subcategory, history],
  );

  return (
    <Layout className="resources">
      <ResourcesBanner
        categorySelected={category}
        subcategorySelected={subcategory}
      />
      {isMobile ? (
        <div className="filter-bar">
          <hr className="line" />
          <ResourcesCatMobile
            category={category}
            categories={categories}
            categorySelectAll={categorySelectAll}
            onOpenChange={onOpenChange}
            openKeys={openKeys}
            subcategory={subcategory}
            subcategorySelect={subcategorySelect}
            costs={costs}
            costSelected={cost}
            languages={languages}
            languageSelected={language}
            locations={locations}
            locationSelected={location}
            sorts={sorts}
            sortSelected={sort}
            setCost={setCost}
            setLanguage={setLanguage}
            setLocation={setLocation}
            setSort={setSort}
          />
          <hr className="line" />
        </div>
      ) : (
        <ResourcesFilter
          costs={costs}
          costSelected={cost}
          languages={languages}
          languageSelected={language}
          locations={locations}
          locationSelected={location}
          sorts={sorts}
          sortSelected={sort}
          setCost={setCost}
          setLanguage={setLanguage}
          setLocation={setLocation}
          setSort={setSort}
        />
      )}
      <Layout style={{ background: 'white' }}>
        {!isMobile && (
          <div>
            <Sider className="filter-sider">
              <ResourceCategoryFilter
                category={category}
                categories={categories}
                categorySelectAll={categorySelectAll}
                onOpenChange={onOpenChange}
                openKeys={openKeys}
                subcategory={subcategory}
                subcategorySelect={subcategorySelect}
              />
            </Sider>
          </div>
        )}
        {loading ? (
          <Loader
            className="loader"
            type="Circles"
            color="#6A3E9E"
            height={100}
            width={100}
          />
        ) : (
          <ResourcesGrid
            filteredResources={filteredResources}
            savedResources={savedSet}
            updateSaved={updateSaved}
          />
        )}
      </Layout>
    </Layout>
  );
}

export default Resources;
