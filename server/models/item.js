const mongoose = require("mongoose");
Schema = mongoose.Schema;

// const { Schema } = mongoose;

// Define the sub-schemas
const TagSchema = new Schema({
  tag: { type: String, required: true },
  description: { type: String, required: true },
});

const AliasSchema = new Schema({
  alias: { type: String, required: true },
  description: { type: String, required: true },
});

const ContactSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
  description: { type: String, required: true },
});

const ExternalDocumentationSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, required: true },
});

const InternalDocumentationSchema = new Schema({
  document: { type: String, required: true },
  history: {
    time: { type: String, required: true },
    updatedBy: { type: String, required: true },
  },
});

const RepoSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, required: true },
});

const ChannelSchema = new Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  description: { type: String, required: true },
});

const InfrastructureComponentSchema = new Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  id: { type: String, required: true },
  description: { type: String, required: true },
});

const MaturityScoreSchema = new Schema({
  metric: { type: String, required: true },
  score: { type: Number, required: true },
  description: { type: String, required: true },
});

const History = new Schema({
  time: { type: String, required: true },
  description: {type: String, required: true},
});

// Define the main schema
const CollectorSchema = new Schema({
  "Entity Type": { type: String, required: true },
  "Service Name": { type: String, required: true },
  Description: { type: String, required: true },
  "Source Repo": { type: String, required: true },
  Product: { type: String, required: true },
  "Entity Tags": { type: [TagSchema], required: true },
  "Programming Language": { type: String, required: true },
  Version: { type: String, required: true },
  "Service Aliases": { type: [AliasSchema], required: true },
  "Last Updated": { type: Date, required: true },
  Contacts: { type: [ContactSchema] },
  "External Documentation": {
    type: [ExternalDocumentationSchema],
    required: true,
  },
  "Internal Documentation": { type: InternalDocumentationSchema },
  "Related Repos": { type: [RepoSchema], required: true },
  "Support Channels": { type: [ChannelSchema], required: true },
  "Monitoring Channels": { type: [ChannelSchema], required: true },
  "Infrastructure Components": {
    type: [InfrastructureComponentSchema],
    required: true,
  },
  "Service Maturity Score(s)": { type: [MaturityScoreSchema], required: true },
  History: { type: [History], required: false },
});

// Create the model
const Item = mongoose.model("Item", CollectorSchema);

module.exports = Item;
