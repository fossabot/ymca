// @flow

import React, { useEffect, useState } from 'react';
import { Button, Col, Row, Carousel, notification } from 'antd';
import { HeartTwoTone } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import type { Testimonial } from '../../pages/Home';

import '../../css/Home.css';
import { getCategories } from '../../utils/api';

type Block1Props = {
  backgroundImage: string,
};

export const HomeBlock1Desktop = ({
  backgroundImage,
}: Block1Props): React$Element<any> => {
  const [categories, setCategories] = useState<Array<string>>([]);

  const fetchCategories = async () => {
    const res = await getCategories();
    const newCategories = [];
    if (res) {
      res.result.forEach((c) => {
        newCategories.push(c.name);
      });
    }
    setCategories(newCategories);
  };

  const openNotification = () => {
    notification.open({
      message: 'COVID-19 Information & Resources',
      description: (
        <>
          Find COVID-19 information & resources for immigrants in C-U in{' '}
          <a href="https://tinyurl.com/cuimmigrantcovid">this guide</a> updated
          daily.
        </>
      ),
      icon: <HeartTwoTone twoToneColor="#eb2f96" />,
      top: 80,
    });
  };

  useEffect(() => {
    fetchCategories();
    openNotification();
  }, []);

  return (
    <Row
      className="home-block-1"
      style={{ backgroundImage }}
      type="flex"
      justify="left"
      align="middle"
    >
      <Col className="welcome-text">
        Welcome to Urbana-Champaign
        {categories && categories.length > 0 ? (
          <Row type="flex">
            <h1 className="welcome-text-bold">Find Resources for</h1>
            <div style={{ width: 'min-content' }}>
              <Carousel
                effect="fade"
                autoplay
                dotPosition="left"
                dots={false}
                autoplaySpeed={3000}
              >
                {categories.map(
                  (category) =>
                    category !== 'Other' && (
                      <Link
                        to={`/resources?category=${category}`}
                        className="welcome-text-link"
                      >
                        {category}
                      </Link>
                    ),
                )}
              </Carousel>
            </div>
          </Row>
        ) : (
          <Row type="flex">
            <h1 className="welcome-text-bold">Find Resources</h1>
          </Row>
        )}
        <Row type="flex" justify="left" align="left">
          <Col span={14}>
            <Link to="/resources">
              <Button type="primary">Find Resources</Button>
            </Link>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export const HomeBlock2Desktop = (): React$Element<any> => (
  <Row className="home-block-2" type="flex" justify="center" align="middle">
    <Col className="home-block-2-divider" span={6}>
      <Row type="flex" justify="start" align="middle">
        <Col span={20} className="home-block-2-left">
          About the Guide
        </Col>
      </Row>
    </Col>
    <Col className="home-block-2-right" span={14}>
      Oasis exists to equalize and promote information access to Champaign
      resources catered to your unique lifestyle and needs. Securing reliable
      transportation, navigating the healthcare system, finding legal aid — it
      can be difficult figuring out where to go in a large place like Champaign
      that has hundreds of resources and a population of over 80,000 people.
      This virtual guide, built with love by{' '}
      <a href="https://uiuc.hack4impact.org/">Hack4Impact</a> curates
      recommendations based on cost, language offerings, and more. As you
      explore Oasis, we would love to hear about your experiences and feedback
      through the{' '}
      <a href="mailto:lalinea@universityymca.org"> Welcome Center.</a>
    </Col>
  </Row>
);

type Block3Props = {
  testimonials: Array<Testimonial>,
};

export const HomeBlock3Desktop = ({
  testimonials,
}: Block3Props): React$Element<any> => (
  <Row className="home-block-3" type="flex" justify="center" align="middle">
    <Col span={23}>
      <Carousel autoplay dotPosition="right" autoplaySpeed={5000} effect="fade">
        {testimonials.map((element) => (
          <div key={`${element.person}-${element.title}`}>
            <Row type="flex" justify="center" align="middle">
              <Col span={5} style={{ marginTop: '1em' }}>
                <img
                  className="testimonial-img"
                  src={element.image}
                  alt="profile"
                />
              </Col>
              <Col className="testimonial-text" span={12} offset={1}>
                <h2>{element.person}</h2>
                <h4>{element.title}</h4>
                <p>{element.testimonial}</p>
              </Col>
            </Row>
          </div>
        ))}
      </Carousel>
    </Col>
  </Row>
);
