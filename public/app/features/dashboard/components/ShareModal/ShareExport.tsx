import React, { PureComponent } from 'react';
import { saveAs } from 'file-saver';
import { Button, Field, Modal, Switch } from '@grafana/ui';
import { DashboardModel, PanelModel } from 'app/features/dashboard/state';
import { DashboardExporter } from 'app/features/dashboard/components/DashExportModal';
import { appEvents } from 'app/core/core';
import { ShowModalEvent } from 'app/types/events';

interface Props {
  dashboard: DashboardModel;
  panel?: PanelModel;
  onDismiss(): void;
}

interface State {
  shareExternally: boolean;
}

export class ShareExport extends PureComponent<Props, State> {
  private exporter: DashboardExporter;

  constructor(props: Props) {
    super(props);
    this.state = {
      shareExternally: false,
    };

    this.exporter = new DashboardExporter();
  }

  onShareExternallyChange = () => {
    this.setState({
      shareExternally: !this.state.shareExternally,
    });
  };

  onSaveAsFile = () => {
    const { dashboard } = this.props;
    const { shareExternally } = this.state;

    if (shareExternally) {
      this.exporter.makeExportable(dashboard).then((dashboardJson: any) => {
        this.openSaveAsDialog(dashboardJson);
      });
    } else {
      this.openSaveAsDialog(dashboard.getSaveModelClone());
    }
  };

  onViewJson = () => {
    const { dashboard } = this.props;
    const { shareExternally } = this.state;

    if (shareExternally) {
      this.exporter.makeExportable(dashboard).then((dashboardJson: any) => {
        this.openJsonModal(dashboardJson);
      });
    } else {
      this.openJsonModal(dashboard.getSaveModelClone());
    }
  };

  openSaveAsDialog = (dash: any) => {
    const dashboardJsonPretty = JSON.stringify(dash, null, 2);
    const blob = new Blob([dashboardJsonPretty], {
      type: 'application/json;charset=utf-8',
    });
    const time = new Date().getTime();
    saveAs(blob, `${dash.title}-${time}.json`);
  };

  openJsonModal = (clone: object) => {
    const model = {
      object: clone,
      enableCopy: true,
    };

    appEvents.publish(
      new ShowModalEvent({
        src: 'public/app/partials/edit_json.html',
        model,
      })
    );

    this.props.onDismiss();
  };

  render() {
    const { onDismiss } = this.props;
    const { shareExternally } = this.state;

    return (
      <>
        <p className="share-modal-info-text">Export this dashboard.</p>
        <Field label="Export for sharing externally">
          <Switch value={shareExternally} onChange={this.onShareExternallyChange} />
        </Field>
        <Modal.ButtonRow>
          <Button variant="secondary" onClick={onDismiss}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={this.onViewJson}>
            View JSON
          </Button>
          <Button variant="primary" onClick={this.onSaveAsFile}>
            Save to file
          </Button>
        </Modal.ButtonRow>
      </>
    );
  }
}
