# Inkit Node SDK

## Installation
```cmd
npm install inkit
```

## Usage

```js
const Inkit = require("inkit");

Inkit.apiToken = "xxxxxxxxx";

// Get list of Folders
await Inkit.Folder.list({
  sort: "created_at",
  data_description: "My",
});

// Create Template (HTML example with inkit_storage destination)
await Inkit.Template.create({
  name: "My HTML template",
  source: "html",
  file: "<html>My awesome HTML</html>",
  data: {
    width: 6.5,
    height: 11.5,
    unit: "in",
  },
  destinations: [
    {
      id: "dest_12345",
      folder_id: "fold_12345",
      expire_after_n_views: 2,
      required: true,
      retain_for: {
        hours: 1,
      },
    },
  ],
});

// Get list of Templates
await Inkit.Template.list({
  search: "My",
  sort: "created_at",
  page: 1,
  source: "docx",
});

// Get single Template
await Inkit.Template.get("tmpl_12345");

// Create Render
await Inkit.Render.create({
  template_id: "tmpl_12345",
  merge_parameters: {
    mp1: "MP1",
    mp2: "MP2",
  },
  destinations: {
    inkit_storage: {
      name: "My awesome render",
      description: "My awesome render description",
    },
    salesforce: {
      record_id: "Your salesforce LinkedEntityId",
      file_name: "My awesome PDF",
      description: "Salesforce PDF description",
    },
  },
});

// Get single Render
await Inkit.Render.get("rend_12345");

// Get list of Renders
await Inkit.Render.list({
  sort: "-created_at",
  page_size: 2,
  page: 1,
  destination_name: "salesforce",
  destination_status: "completed",
});

// Get PDF document
await Inkit.Render.get_pdf("rend_12345");

//Create renders Batch
await Inkit.Batch.create({
  template_id: "tmpl_123456",
  renders: [
    {
      merge_parameters: {
        mp1: "MP1",
        mp2: "MP2",
      },
      destinations: {
        inkit_storage: {
          name: "My first batch render",
          description: "My first batch render description",
        },
        salesforce: {
          record_id: "Your salesforce LinkedEntityId",
          file_name: "My first awesome PDF",
          description: "Salesforce first PDF description",
        },
      },
    },
    {
      merge_parameters: {
        mp1: "MP11",
        mp2: "MP22",
      },
      destinations: {
        inkit_storage: {
          name: "My second batch render",
        },
        salesforce: {
          record_id: "Your salesforce LinkedEntityId",
          file_name: "My second awesome PDF",
          description: "Salesforce second PDF description",
        },
      },
    },
  ],
});

// Get list of renders Batches
await Inkit.Batch.list({ destination_name: "inkit_storage" });

// Get single renders Batch
await Inkit.Batch.get("rb_12345");

// Get list of Documents
await Inkit.Document.list({ search: "My" });

// Get single Document
await Inkit.Document.get("doc_12345");

// Delete Document
await Inkit.Document.delete("doc_12345");

// Get PDF document
await Inkit.Document.download("doc_12345");
```
