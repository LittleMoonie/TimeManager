import React from 'react';
import Layout from '@docusaurus/theme-classic/lib/theme/Layout';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  return (
    <Layout title="API Docs" description="GoGoTime API Documentation">
      <SwaggerUI url="/swagger.json" />
    </Layout>
  );
}
