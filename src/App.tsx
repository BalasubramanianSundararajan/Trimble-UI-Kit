import React, { useCallback, useEffect, useState } from "react";
import "./App.scss";
import {
  Form,
  ListGroup,
  Button,
  FormGroup,
  TreeView,
  TreeViewItem,
  Badge,
} from "@trimbleinc/modus-react-bootstrap";

const dummyData = [
  {
    name: "LoginPage",
    imageURL:
      "https://templategenstg.blob.core.windows.net/images/LoginPage.png",
    title: "Login page",
    description: "A simple Login UI for mobile applications.",
    dependencies: [
      {
        name: "LoginPage.xaml",
        folder: "Views",
      },
      {
        name: "LoginPage.xaml.cs",
        folder: "Views",
      },
      {
        name: "LoginPageViewModel.cs",
        folder: "ViewModels",
      },
      {
        name: "Data.cs",
        folder: "Models",
      },
    ],
  },
];


const DependencyTree: React.FunctionComponent<{
  name: string;
  dependencies: any[];
}> = ({ name, dependencies }) => {
  return (
    dependencies && (
      <TreeView
        nodeId={0}
        id="filesTree"
        size="sm"
        className="list-group-borderless mb-2"
        defaultSelected={[1, 2]}
      >
        <TreeViewItem
          nodeId={1}
          label={name}
          itemIcon={<i className="modus-icons">folder</i>}
        >
          {dependencies
            .map((a: any) => a.folder)
            .filter(
              (value: any, index: number, self: string | any[]) =>
                self.indexOf(value) === index
            )
            .map((d: any, index: number) => (
              <TreeViewItem
                nodeId={index + 2}
                label={d}
                itemIcon={<i className="modus-icons">folder</i>}
              >
                {dependencies
                  .filter((a: any) => a.folder === d)
                  .map((b: any, indexC: number) => (
                    <TreeViewItem
                      nodeId={indexC + 12}
                      label={b.name}
                      itemIcon={<i className="modus-icons">clipboard</i>}
                    ></TreeViewItem>
                  ))}
              </TreeViewItem>
            ))}
        </TreeViewItem>
      </TreeView>
    )
  );
};

const DownloadForm: React.FunctionComponent<{ templates: any[] }> = ({
  templates,
}) => {
  const [isRunnablePackage, setRunnablePackage] = useState(false);
  const [appName, setAppName] = useState<string>();
  const [startup, setStartUp] = useState<string>();

  const handleSelection = useCallback(
    (flag: boolean) => {
      setRunnablePackage(flag);
    },
    [setRunnablePackage]
  );

  const handleDownload = useCallback(() => {
    fetch(
      "https://template-generator-ui.azurewebsites.net/api/Package/Bundle",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          AppName: appName,
          Templates: templates.map((t) => t.name),
          Platform: 0,
          StartupPage: startup,
          PackageType: isRunnablePackage ? 0 : 1,
        }),
      }
    )
      .then((response) => {
        return response.blob();
      })
      .then((data) => {
        // (C2) TO "FORCE DOWNLOAD"
        var url = window.URL.createObjectURL(data),
          anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${appName || "trimble-ui-kit"}.zip`;
        anchor.click();

        // (C3) CLEAN UP
        window.URL.revokeObjectURL(url);
        document.removeChild(anchor);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [isRunnablePackage, appName, startup, templates]);

  return (
    <div className="mt-5">
      <Form>
        How do you want to download?
        <FormGroup controlId="downloadType">
          <Form.Check
            type="radio"
            id="plain"
            custom
            checked={!isRunnablePackage}
            label="Plain files"
            onClick={() => handleSelection(false)}
          />
          <Form.Check
            type="radio"
            id="package"
            custom
            checked={isRunnablePackage}
            label="Runnable Solution"
            onClick={() => handleSelection(true)}
          />
        </FormGroup>
        <Form.Group controlId="appName">
          <Form.Label>Namespace for Solution</Form.Label>
          <Form.Control
            as="input"
            placeholder="Namespace"
            disabled={!isRunnablePackage}
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
          ></Form.Control>
        </Form.Group>
        {/* <Form.Group controlId="homepage">
          <Form.Label>Startup page</Form.Label>
          <Form.Control
            as="input"
            placeholder="Startup Page"
            disabled={!isRunnablePackage}
            value={startup}
            onChange={(e) => setStartUp(e.target.value)}
          ></Form.Control>
        </Form.Group> */}
        <Form.Group controlId="homepage">
          <Form.Label>Startup page</Form.Label>
          <Form.Control
            as="select"
            custom
            onChange={(e) => setStartUp(e.target.value)}
          >
            {templates.map((t) => (
              <option value={t.name}>{t.title}</option>
            ))}
          </Form.Control>
        </Form.Group>
      </Form>
      <div className="d-flex justify-content-end">
        <Button
          variant="primary"
          className="mr-2"
          onClick={() => handleDownload()}
        >
          Download
        </Button>
      </div>
    </div>
  );
};

function App() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selection, setSelection] = useState<any[]>([]);
  const [leftSidePanel, setLeftSidePanel] = useState(false);

  useEffect(() => {
    fetch(
      "https://template-generator-ui.azurewebsites.net/api/Template/PlatformTemplates"
    )
      .then((res) => {
        return res.text();
      })
      .then(function (text) {
        return text ? JSON.parse(text) : dummyData;
      })
      .then(
        (result) => {
          setTemplates(result);
        },
        (error) => {
          setTemplates(dummyData);
        }
      );
  }, [setTemplates]);

  const toggleTemplatesSelection = useCallback(
    (name: string) => {
      const selectedItems = [
        ...(selection || []).filter((t) => t.name === name),
      ];
      if (selectedItems.length) {
        const newItems = [...(selection || []).filter((t) => t.name !== name)];
        setSelection(newItems);
      } else {
        const newItems = [
          ...(selection || []),
          ...templates.filter((t) => t.name === name),
        ];
        setSelection(newItems);
      }
    },
    [templates, selection, setSelection]
  );

  const isTemplateSelected = useCallback(
    (name: string) =>
      [...(selection || []).filter((t) => t.name === name)].length > 0,
    [selection]
  );

  return (
    <div style={{ height: "100%" }}>
      <div
        className="position-relative p-0 border"
        id="interactiveExample"
        style={{ height: "100%", zIndex: "10" }}
      >
        <div className="modus-layout">
          <nav
            className="navbar nav navbar-expand-lg modus-header"
            id="modusHeader"
          >
            <a
              id="menuButton"
              data-modus-item="menu-btn"
              onClick={() => setLeftSidePanel(!leftSidePanel)}
            >
              <i className="modus-icon material-icons menu-btn">menu</i>
            </a>
            <div className="navbar-nav mr-auto">
              <div className="navbar-text">
                <span className="h3">TRIMBLE UI KITS</span>
              </div>
            </div>
            <div className="collapse navbar-collapse">
              <div className="navbar-nav ml-auto">
                <a
                  href="#interactive-example"
                  className="btn btn-lg btn-icon-only btn-text-primary"
                >
                  <i className="modus-icon material-icons">account_circle</i>
                </a>
                <a
                  href="#interactive-example"
                  className="btn btn-lg btn-icon-only btn-text-primary"
                >
                  <i className="modus-icon material-icons">apps</i>
                </a>
              </div>
            </div>
          </nav>
          <div
            className={`modus-body ${
              leftSidePanel ? "sidebar-open" : "sidebar-closed"
            }`}
            data-modus-item="body"
            id="modusBody"
          >
            <nav className="nav flex-column modus-sidebar" id="modusSidebar">
              <ul>
                <li>
                  <a href="#interactive-example" className="nav-link active">
                    <span className="left-nav-icon">
                      <i className="modus-icons">blocks_four_outline</i>
                    </span>
                    MAUI
                  </a>
                </li>
                <li>
                  <a href="#interactive-example" className="nav-link">
                    <span className="left-nav-icon">
                      <i className="modus-icons">preview</i>
                    </span>
                    React{" "}
                    <Badge className="ml-2" variant="warning">
                      Coming soon!
                    </Badge>
                  </a>
                </li>
                <li>
                  <a href="#interactive-example" className="nav-link">
                    <span className="left-nav-icon">
                      <i className="modus-icons">dashboard</i>
                    </span>
                    Angular{" "}
                    <Badge className="ml-2" variant="warning">
                      Coming soon!
                    </Badge>
                  </a>
                </li>
              </ul>
            </nav>
            <div className="modus-content-rows" id="modusContentRows">
              <div className="modus-toolbar" id="modusToolbar"></div>
              <div className="modus-content-columns" id="modusContentColumns">
                <div
                  className="modus-content row list bg-white p-5"
                  id="modusContent"
                >
                  {templates.map(
                    ({ imageURL, name, title, description, dependencies }) => (
                      <div
                        className="col-12 col-lg-6 col-xl-4 my-3"
                        data-tags="null"
                      >
                        <div>
                          <div className="card-template card card-blog-brief h-100 border bg-light shadow">
                            <div
                              className="card-header card-accordions top-rounded mb-0 pb-0 border-0"
                              style={{
                                height: "500px",
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <img
                                src={imageURL}
                                style={{ maxHeight: "100%", maxWidth: "100%" }}
                              />
                            </div>
                            <div className="card-body bg-white border-0 pb-0">
                              <h3 className="card-title px-2 ml-n2 name">
                                {title}
                              </h3>
                              <p className="px-2 ml-n2">{description}</p>
                              <DependencyTree
                                name={name}
                                dependencies={dependencies}
                              />
                            </div>
                          </div>
                          <div className="d-flex justify-content-center">
                            <Form.Check
                              custom
                              type="checkbox"
                              id={`custom-checkbox-${name}`}
                              label={`${title} template`}
                              checked={isTemplateSelected(name)}
                              onClick={() => toggleTemplatesSelection(name)}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
                <div className="modus-panel panel-lg shadow-sm" id="modusPanel">
                  <div className="panel-header">
                    <h5>Selected templates</h5>
                  </div>
                  <div className="panel-body" style={{ flexGrow: 1 }}>
                    <div className="scroll-container p-2">
                      <ListGroup>
                        {selection?.map(({ title, name }) => (
                          <ListGroup.Item className="list-item-right-control">
                            <span>{title}</span>
                            <div
                              onClick={(e) => toggleTemplatesSelection(name)}
                              style={{ cursor: "pointer" }}
                            >
                              <i className="modus-icons">trash</i>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>

                      {selection?.length > 0 && (
                        <DownloadForm templates={selection}></DownloadForm>
                      )}
                    </div>
                  </div>
                  <div className="panel-footer p-2"></div>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="modus-footer d-flex justify-content-end">
            @copyright Trimble
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default App;
