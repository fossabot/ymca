// @flow

/*
TODO: Implement phoneType into form.
*/

import React from 'react';
import '../css/ResourcePhoneNumberForm.css';
import { Input, Form, Button, Descriptions } from 'antd';

const FinancialAidForm = Form.create({ name: 'financialAid' })(props => {
  const { setFinancialAidDetails, setTotalSubmitEnabled } = props;

  const { getFieldDecorator, getFieldValue } = props.form;

  return (
    <Form
      className="financialAidForm"
      onSubmit={() => {
        setFinancialAidDetails({
          education: getFieldValue('education'),
          immigrationStatus: getFieldValue('immigrationStatus'),
          deadline: getFieldValue('deadline'),
        });
      }}
    >
      <Form.Item>
        {getFieldDecorator(
          'education',
          {},
        )(
          <Input
            placeholder="Education"
            onFocus={() => setTotalSubmitEnabled(false)}
            onBlur={() => setTotalSubmitEnabled(true)}
          />,
        )}
      </Form.Item>
      <Form.Item>
        {getFieldDecorator(
          'immigrationStatus',
          {},
        )(
          <Input
            placeholder="Immigration Status"
            onFocus={() => setTotalSubmitEnabled(false)}
            onBlur={() => setTotalSubmitEnabled(true)}
          />,
        )}
      </Form.Item>
      <Form.Item>
        {getFieldDecorator(
          'deadline',
          {},
        )(
          <Input
            placeholder="Deadline"
            onFocus={() => setTotalSubmitEnabled(false)}
            onBlur={() => setTotalSubmitEnabled(true)}
          />,
        )}
      </Form.Item>
      <Button type="primary" htmlType="submit" className="financialAidForm">
        Add Financial Aid Details
      </Button>
    </Form>
  );
});

const FinancialAidFormItem = (props: FormProps) => {
  const {
    financialAidDetails,
    setFinancialAidDetails,
    setTotalSubmitEnabled,
  } = props;

  return (
    <Form.Item>
      <Descriptions title="Financial Aid Details">
        <Descriptions.Item label="Education">
          {financialAidDetails.education}
        </Descriptions.Item>
        <Descriptions.Item label="Immigration Status">
          {financialAidDetails.immigrationStatus}
        </Descriptions.Item>
        <Descriptions.Item label="Deadline">
          {financialAidDetails.deadline}
        </Descriptions.Item>
      </Descriptions>
      <FinancialAidForm
        financialAidDetails={financialAidDetails}
        setFinancialAidDetails={setFinancialAidDetails}
        setTotalSubmitEnabled={setTotalSubmitEnabled}
      />
    </Form.Item>
  );
};

export default FinancialAidFormItem;