/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiCallOut,
  EuiCheckbox,
  EuiCompressedFieldText,
  EuiDescribedFormGroup,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiLink,
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiTitle,
} from '@elastic/eui';
import React, { Fragment, useEffect, useState } from 'react';
import {
  TRACE_CUSTOM_SERVICE_INDEX_SETTING,
  TRACE_CUSTOM_SPAN_INDEX_SETTING,
  TRACE_CUSTOM_MODE_DEFAULT_SETTING,
} from '../../../../../common/constants/trace_analytics';
import { uiSettingsService } from '../../../../../common/utils';
import { useToast } from '../../../common/toast';

interface CustomIndexFlyoutProps {
  isFlyoutVisible: boolean;
  setIsFlyoutVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CustomIndexFlyout = ({
  isFlyoutVisible,
  setIsFlyoutVisible,
}: CustomIndexFlyoutProps) => {
  const { setToast } = useToast();
  const [spanIndices, setSpanIndices] = useState('');
  const [serviceIndices, setServiceIndices] = useState('');
  const [customModeDefault, setCustomModeDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onChangeSpanIndices = (e: { target: { value: React.SetStateAction<string> } }) => {
    setSpanIndices(e.target.value);
  };

  const onChangeServiceIndices = (e: { target: { value: React.SetStateAction<string> } }) => {
    setServiceIndices(e.target.value);
  };

  const onToggleCustomModeDefault = (e: { target: { checked: boolean } }) => {
    setCustomModeDefault(e.target.checked);
  };

  useEffect(() => {
    setSpanIndices(uiSettingsService.get(TRACE_CUSTOM_SPAN_INDEX_SETTING));
    setServiceIndices(uiSettingsService.get(TRACE_CUSTOM_SERVICE_INDEX_SETTING));
    setCustomModeDefault(uiSettingsService.get(TRACE_CUSTOM_MODE_DEFAULT_SETTING) || false);
  }, [uiSettingsService]);

  const onSaveSettings = async () => {
    try {
      setIsLoading(true);
      await uiSettingsService.set(TRACE_CUSTOM_SPAN_INDEX_SETTING, spanIndices);
      await uiSettingsService.set(TRACE_CUSTOM_SERVICE_INDEX_SETTING, serviceIndices);
      await uiSettingsService.set(TRACE_CUSTOM_MODE_DEFAULT_SETTING, customModeDefault);
      setIsLoading(false);
      setToast('Updated trace analytics settings successfully', 'success');
    } catch (error) {
      console.error(error);
      setToast('Failed to update trace analytics settings', 'danger');
    }
    setIsLoading(false);
  };

  const callout = (
    <EuiCallOut
      title="Custom source in trace analytics is an experimental feature"
      color="warning"
      iconType="help"
    >
      <p>
        This feature is experimental, all indices added here should adhere to data prepper index
        mappings. For more information on mappings, visit{' '}
        <EuiLink
          href="https://github.com/opensearch-project/data-prepper/tree/main/docs/schemas/trace-analytics"
          target="_blank"
        >
          schema documentation
        </EuiLink>
        .
      </p>
    </EuiCallOut>
  );
  let flyout;

  if (isFlyoutVisible) {
    flyout = (
      <EuiFlyout ownFocus onClose={() => setIsFlyoutVisible(false)} aria-labelledby="flyoutTitle">
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h3 id="flyoutTitle">Manage custom source</h3>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody banner={callout}>
          <EuiDescribedFormGroup
            title={<h3>Custom span indices</h3>}
            description={
              <Fragment>
                Configure custom span indices to be used by the trace analytics plugin
              </Fragment>
            }
          >
            <EuiFormRow label="Custom span indices">
              <EuiCompressedFieldText
                name="spanIndices"
                aria-label="spanIndices"
                placeholder="index1,cluster1:index2,cluster:index3"
                value={spanIndices}
                onChange={onChangeSpanIndices}
              />
            </EuiFormRow>
          </EuiDescribedFormGroup>
          <EuiDescribedFormGroup
            title={<h3>Custom service indices</h3>}
            description={
              <Fragment>
                Configure custom service indices to be used by the trace analytics plugin
              </Fragment>
            }
          >
            <EuiFormRow label="Custom service indices">
              <EuiCompressedFieldText
                name="serviceIndices"
                aria-label="serviceIndices"
                placeholder="index1,cluster1:index2,cluster:index3"
                value={serviceIndices}
                onChange={onChangeServiceIndices}
              />
            </EuiFormRow>
          </EuiDescribedFormGroup>
          <EuiDescribedFormGroup
            title={<h3>Set default mode</h3>}
            description={
              <Fragment>
                Enable this to set &quot;Custom source&quot; as the default mode for trace analytics
              </Fragment>
            }
          >
            <EuiFormRow>
              <EuiCheckbox
                id="customModeDefault"
                label="Enable custom source as default mode"
                checked={customModeDefault}
                onChange={onToggleCustomModeDefault}
              />
            </EuiFormRow>
          </EuiDescribedFormGroup>
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiSmallButtonEmpty
                iconType="cross"
                onClick={() => setIsFlyoutVisible(false)}
                flush="left"
              >
                Close
              </EuiSmallButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSmallButton
                onClick={async () => {
                  await onSaveSettings();
                  setIsFlyoutVisible(false);
                }}
                fill
                isLoading={isLoading}
              >
                Save
              </EuiSmallButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
  return <div>{flyout}</div>;
};
