// @flow

import React, { useState, useEffect, useCallback } from 'react';
import { Redirect } from 'react-router-dom';
import {
  DollarCircleFilled,
  FolderOpenFilled,
  PhoneFilled,
  WechatFilled,
} from '@ant-design/icons';
import { Carousel, Row, Col, Timeline } from 'antd';
import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl';
import moment from 'moment';

import ResourcesBreadcrumb from '../ResourcesBreadcrumb';
import SaveButton from '../SaveButton';
import ShareButton from '../ShareButton';
import { getResourceByID } from '../../utils/api';
import {
  saveResource,
  deleteSavedResource,
  getSavedResources,
} from '../../utils/auth';
import determineStockPhoto from '../../utils/determineStockPhoto';

import '../../css/ResourceDetailMobile.css';
import { useAuth } from '../../utils/use-auth';

type Props = {
  match: {
    params: {
      id: any,
    },
  },
};

const ResourceDetailMobile = (props: Props) => {
  const { authed, authRoleIsEquivalentTo } = useAuth();

  const { match } = props;

  const resourceId = match.params.id;

  /* SETUP START */

  // ResourceDetail page will get all this stuff prior to this
  // being loaded but for right now everything will be fetched.
  // by this component.
  const [name, setName] = useState(null);
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [description, setDescription] = useState(null);
  const [website, setWebsite] = useState(null);
  const [email, setEmail] = useState(null);
  const [phone, setPhone] = useState([]);
  const [address, setAddress] = useState(null);
  const [addressLine2, setAddressLine2] = useState(null);
  // const [aptUnitSuite, setAptUnitSuite] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [languages, setLanguages] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState(null);
  const [cost, setCost] = useState(null);
  // const [internalNotes, setInternalNotes] = useState([]);
  const [hours, setHours] = useState(null);
  const [image, setImage] = useState(null);
  const [financialAidDetails, setFinancialAidDetails] = useState(null);
  const [contacts, setContacts] = useState(null);
  const [resourceExists, setResourceExists] = useState(true);
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [distFromResource, setDistFromResource] = useState(null);
  const [eligibility, setEligibility] = useState('');
  // const [modalVisible, setModalVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isWithinOperationHours, setIsWithinOperationHours] = useState(null);

  // componentDidMount
  useEffect(() => {
    async function loadResource() {
      const response = await getResourceByID(resourceId, true);

      if (response) {
        const { result } = response;

        setImage(
          result.image && result.image !== ''
            ? result.image
            : determineStockPhoto(result.category, result.subcategory),
        );

        setCategory(result.category.length > 0 && result.category[0]);
        setSubcategory(result.subcategory.length > 0 && result.subcategory[0]);

        setName(result.name);
        setDescription(result.description);

        setPhone(result.phoneNumbers);
        setEmail(result.email);
        setWebsite(result.website);

        setLanguages(result.availableLanguages);
        setCost(result.cost);

        setAddress(result.address);
        setAddressLine2(result.addressLine2);
        setCity(result.city);
        setState(result.state);
        setZip(result.zip);
        setRequiredDocuments(result.requiredDocuments);
        setEligibility(result.eligibilityRequirements);
        setFinancialAidDetails(result.financialAidDetails);
        setContacts(result.contacts);

        setHours(
          result.hoursOfOperation &&
            result.hoursOfOperation.hoursOfOperation.length > 0
            ? result.hoursOfOperation.hoursOfOperation
            : null,
        );

        setLat(result.lat || 0);
        setLng(result.lng || 0);
      } else {
        setResourceExists(false);
      }
    }

    loadResource();
  }, [resourceId]);

  const saveResourceHandler = useCallback(async () => {
    const result = await saveResource(resourceId);
    if (result != null && result.code === 200) {
      setIsSaved(true);
    }
  }, [resourceId]);

  const deleteResourceHandler = useCallback(async () => {
    const result = await deleteSavedResource(resourceId);
    if (result != null && result.code === 200) {
      setIsSaved(false);
    }
  }, [resourceId]);

  useEffect(() => {
    async function updateIsSaved() {
      if (authed) {
        let savedSet = new Set();
        const json = await getSavedResources();
        savedSet = new Set(json.result);

        setIsSaved(!!savedSet.has(resourceId));
      }
    }
    updateIsSaved();
  }, [authed, resourceId]);

  useEffect(() => {
    function updateDistFromResource() {
      function deg2rad(deg) {
        return deg * (Math.PI / 180);
      }

      function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1); // deg2rad below
        const dLon = deg2rad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
      }

      window.navigator.geolocation.getCurrentPosition((pos) => {
        setDistFromResource(
          (
            getDistanceFromLatLonInKm(
              lat,
              lng,
              pos.coords.latitude,
              pos.coords.longitude,
            ) / 1.60924
          ).toFixed(1),
        );
      });
    }

    if (
      window.navigator.geolocation &&
      lat !== null &&
      lat !== 0 &&
      lng !== null &&
      lng !== 0
    ) {
      updateDistFromResource();
    }
  }, [lat, lng]);

  useEffect(() => {
    setIsWithinOperationHours(
      hours &&
        hours.map((entry) => {
          const { day } = entry;
          const { period } = entry;
          let withinHours = false;

          if (period) {
            const givenDay = moment().day(day).day();
            const start = moment(period[0], 'h:mm a');
            const startHour = start.hour();
            const startMin = start.minute();
            const end = moment(period[1], 'h:mm a');
            const endHour = end.hour();
            const endMin = end.minute();
            const now = moment();
            const nowHour = now.hour();
            const nowMin = now.minute();
            const nowDay = now.day();

            if (nowDay === givenDay) {
              const inHour =
                Math.min(nowHour, startHour) === startHour &&
                Math.max(nowHour, endHour) === endHour;

              if (inHour) {
                if (nowHour === startHour || nowHour === endHour) {
                  withinHours =
                    (nowHour === startHour &&
                      Math.min(nowMin, startMin) === startMin) ||
                    (nowHour === endHour &&
                      Math.max(nowMin, endMin) === endMin);
                } else {
                  withinHours = true;
                }
              }
            }
          }

          return { day, withinHours };
        }),
    );
  }, [hours]);

  if (!resourceExists) {
    return <Redirect to="/resources/unknown" />;
  }

  const Map = ReactMapboxGl({
    accessToken:
      'pk.eyJ1IjoiYW5vb2psYWwiLCJhIjoiY2syemtiYjZoMGp1' +
      'eDNscXQ3azJzajl0bCJ9.FDSFjP1IfSisbm4uvd70vg',
    interactive: true,
  });

  /* SETUP END */

  return (
    <div className="mb-rd-container">
      <Carousel className="mb-rd-carousel">
        {image ? (
          <img className="mb-rd-carousel-img" src={image} alt="" />
        ) : (
          <div />
        )}
      </Carousel>
      <div className="mb-rd-block-container">
        <div className="mb-rd-block-1">
          <ResourcesBreadcrumb
            categorySelected={category}
            subcategorySelected={subcategory}
            resourceSelected={name}
          />
          <Row className="mb-rd-header-bar" type="flex">
            <Col>
              <h2 className="mb-rd-header-text">{name}</h2>
            </Col>
            <Col>
              <SaveButton
                isSaved={isSaved}
                deleteResourceHandler={deleteResourceHandler}
                saveResourceHandler={saveResourceHandler}
              />
              <ShareButton />
            </Col>
          </Row>
          <Row className="mb-rd-description-container">
            <Col className="mb-rd-description" span={20}>
              {description}
              <Row>
                {eligibility && `Eligibility Requirements: ${eligibility}`}
              </Row>
            </Col>
          </Row>
        </div>
        <div className="mb-rd-block-2">
          <Row className="mb-rd-block-title">Basic Information</Row>
          <InfoBlock
            title="Contact Information"
            icon={<PhoneFilled className="mb-rd-phone-icon mb-rd-icon" />}
            content={[].concat(
              phone && phone.length > 0
                ? phone.map(
                    (entry) =>
                      `${
                        entry.phoneType.charAt(0).toUpperCase() +
                        entry.phoneType.slice(1)
                      }: ${entry.phoneNumber}`,
                  )
                : ['No phone number provided.'],
              [
                email || 'No email provided.',
                <a href={website} key="website">
                  {website || 'No website provided.'}
                </a>,
              ],
            )}
          />
          <InfoBlock
            title="Languages Spoken"
            icon={<WechatFilled className="mb-rd-icon" />}
            content={[
              languages && languages.length > 0
                ? languages.join(', ')
                : 'None provided.',
            ]}
          />
          <InfoBlock
            title="Cost"
            icon={<DollarCircleFilled className="mb-rd-icon" />}
            content={[cost || 'None provided.']}
          />
          <InfoBlock
            title="Required Documents"
            icon={<FolderOpenFilled className="mb-rd-icon" />}
            content={[
              (requiredDocuments && requiredDocuments.join(', ')) ||
                'None provided.',
            ]}
          />
          <InfoBlock
            title="Financial Aid"
            icon={
              <img
                className="rd-mb-financial-aid-icon"
                src="/asset/icon/give-money-black.svg"
                alt="give-money-black.svg"
                height="22"
                width="22"
              />
            }
            content={[
              financialAidDetails &&
              (financialAidDetails.education ||
                financialAidDetails.immigrationStatus ||
                financialAidDetails.deadline ||
                financialAidDetails.amount) ? (
                <div>
                  <Row
                    justify="space-between"
                    style={{ paddingLeft: 0, paddingBottom: 0 }}
                  >
                    <Col span={12}>
                      <div className="rd-mb-financial-aid-subtitle">
                        Education:
                      </div>
                      {financialAidDetails.education || 'None provided.'}
                    </Col>
                    <Col span={12}>
                      <div className="rd-mb-financial-aid-subtitle">
                        Immigration Status:
                      </div>
                      {financialAidDetails.immigrationStatus ||
                        'None provided.'}
                    </Col>
                  </Row>
                  <Row
                    justify="space-between"
                    style={{ paddingLeft: 0, paddingBottom: 0 }}
                  >
                    <Col span={12}>
                      <div className="rd-mb-financial-aid-subtitle">
                        Deadline:
                      </div>
                      {financialAidDetails.deadline || 'None provided.'}
                    </Col>
                    <Col span={12}>
                      <div className="rd-mb-financial-aid-subtitle">
                        Amount:
                      </div>
                      {financialAidDetails.amount || 'None provided.'}
                    </Col>
                  </Row>
                </div>
              ) : (
                'None provided.'
              ),
            ]}
          />
        </div>
        {authRoleIsEquivalentTo('admin') && (
          <div className="mb-rd-block-2">
            <Row className="mb-rd-block-title">Recommended Contacts</Row>
            {contacts && contacts.length > 0
              ? contacts.map((contact) => (
                  <InfoBlock
                    title={contact.name}
                    key={contact.name}
                    icon={
                      <img
                        src="/asset/icon/user.svg"
                        alt="give-money-black.svg"
                        height="22"
                        width="22"
                      />
                    }
                    content={[
                      <Row
                        justify="space-between"
                        style={{ paddingLeft: 0, paddingBottom: 0 }}
                        key={contact.name}
                      >
                        {Object.entries(contact).map(([key, value]) => {
                          if (key !== '_id' && key !== 'name') {
                            const firstLetterUpper = key
                              .substring(0, 1)
                              .toUpperCase();
                            const restOfLabel = key
                              .substring(1)
                              .match(/[A-Z][a-z]+/g);
                            const restOfFirstWord = restOfLabel
                              ? key.substring(1, key.indexOf(restOfLabel[0]))
                              : key.substring(1);

                            return (
                              <Col span={12}>
                                <div className="rd-mb-financial-aid-subtitle">
                                  {`${firstLetterUpper}${restOfFirstWord}${
                                    restOfLabel
                                      ? ` ${restOfLabel.join(' ')}`
                                      : ''
                                  }:`}
                                </div>
                                {value || 'None provided.'}
                              </Col>
                            );
                          }

                          return null;
                        })}
                      </Row>,
                    ]}
                  />
                ))
              : 'None provided.'}
          </div>
        )}
        <div className="mb-rd-block-2">
          <Row className="mb-rd-block-title">Location</Row>
          <div className="mb-rd-location-info mb-rd-thin-text">
            <Row>{address}</Row>
            {addressLine2 && <Row>{addressLine2}</Row>}
            <Row justify="space-between">
              <Col>{`${city}${state && state.length > 0 && `, ${state}`}${
                zip && zip.length > 0 && ` ${zip}`
              }`}</Col>
              <Col>{distFromResource && `${distFromResource} mi`}</Col>
            </Row>
          </div>
          <Row>
            <Map
              style="mapbox://styles/mapbox/light-v9"
              center={[lng, lat]}
              containerStyle={{
                height: '350px',
                width: '100%',
              }}
              zoom={[15]}
            >
              <Layer
                type="symbol"
                id="marker"
                layout={{ 'icon-image': 'marker-15' }}
              >
                <Feature coordinates={[lng, lat]} />
              </Layer>
            </Map>
          </Row>
        </div>
        <div className="mb-rd-block-2">
          <Row className="mb-rd-block-title">Schedule</Row>
          <Row>
            <Timeline className="mb-rd-schedule">
              {[
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
              ].map((day) => (
                <ScheduleEntry
                  day={day}
                  key={day}
                  period={
                    hours &&
                    hours.filter((entry) => entry.day === day)[0].period
                  }
                  isWithinOperationHours={
                    isWithinOperationHours &&
                    isWithinOperationHours.filter(
                      (entry) => entry.day === day,
                    )[0].withinHours
                  }
                />
              ))}
            </Timeline>
          </Row>
        </div>
      </div>
    </div>
  );
};

type ScheduleEntryProps = {
  day: String,
  period: [String],
  isWithinOperationHours: Boolean,
};
const ScheduleEntry = (props: ScheduleEntryProps) => {
  const { day, period, isWithinOperationHours } = props;

  const startTime = period && period[0];
  const endTime = period && period[1];

  return (
    <Timeline.Item
      color="rgb(136, 216, 208)"
      dot={<div className="mb-rd-schedule-dot" />}
    >
      <div className="md-rd-schedule-entry">
        <Row className="mb-rd-schedule-entry-title">{day}</Row>
        <Row className="mb-rd-schedule-text">
          {startTime && endTime ? `${startTime} - ${endTime}` : 'None'}
        </Row>
        {isWithinOperationHours && (
          <Row className="mb-rd-schedule-open-now">Open now!</Row>
        )}
      </div>
    </Timeline.Item>
  );
};

type InfoBlockProps = {
  className: String,
  title: String,
  icon: any,
  content: any,
};
const InfoBlock = (props: InfoBlockProps) => {
  const { icon, title, content, className } = props;

  return (
    <Row className={`mb-rd-info-block ${className}`} gutter={[16, 16]}>
      <Col span={4}>
        <Row className="mb-rd-icon-container" type="flex" justify="center">
          {icon}
        </Row>
      </Col>
      <Col span={20}>
        <Row className="mb-rd-info-title">{title}</Row>
        {content &&
          content.map((entry) => (
            <Row className="mb-rd-thin-text" key={entry}>
              {entry}
            </Row>
          ))}
      </Col>
    </Row>
  );
};

export default ResourceDetailMobile;
