const mongoose = require('mongoose');

const { Schema } = mongoose;

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

const DocumentationSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, required: true },
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

// Define the main schema
const CollectorSchema = new Schema({
  "Entity Type": { type: String, required: true },
  "Service Name": { type: String, required: true },
  Description: { type: String, required: true },
  "Source Repo": { type: String, required: true },
  Product: { type: String, required: true },
  "Entity Tags": [TagSchema],
  "Programming Language": { type: String, required: true },
  Version: { type: String, required: true },
  "Service Aliases": [AliasSchema],
  "Last Updated": { type: Date, required: true },
  Contacts: [ContactSchema],
  Documentation: [DocumentationSchema],
  "Related Repos": [RepoSchema],
  "Support Channels": [ChannelSchema],
  "Monitoring Channels": [ChannelSchema],
  "Infrastructure Components": [InfrastructureComponentSchema],
  "Service Maturity Score(s)": [MaturityScoreSchema],
});

// Create the model
const Item = mongoose.model('Item', CollectorSchema);

module.exports = Item;
