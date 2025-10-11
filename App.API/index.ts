import 'reflect-metadata';

import http from 'http';

import server from './Server/index';
import { OpenApiService } from './Service/OpenApiService';
import './Entity/Timesheets/TimesheetHistory'; // Explicitly import TimesheetHistory for tsoa

const { PORT } = process.env;

const httpServer = http.createServer({}, server);

httpServer.listen(PORT, async () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
  
  // Wait a moment for server to be fully ready
  setTimeout(async () => {
    try {
      // Check if OpenAPI spec needs regeneration
      const needsRegeneration = await OpenApiService.needsRegeneration();
      
      if (needsRegeneration) {
        console.log('📝 Detected API changes, auto-generating OpenAPI spec...');
        
        const result = await OpenApiService.generateOpenApiSpec(true);
        
        if (result.success) {
          console.log('✅ OpenAPI spec auto-generated successfully');
          console.log(`📖 API Documentation available at: http://localhost:${PORT}/api/docs`);
        } else {
          console.warn('⚠️ OpenAPI auto-generation failed:', result.message);
          console.log('💡 You can manually trigger generation via: yarn api:sync');
        }
      } else {
        console.log('✅ OpenAPI spec is up to date');
        console.log(`📖 API Documentation available at: http://localhost:${PORT}/api/docs`);
      }
    } catch (error) {
      console.warn('⚠️ OpenAPI auto-generation check failed:', error);
      console.log('💡 You can manually trigger generation via: yarn api:sync');
    }
  }, 1000); // 1 second delay to ensure server is ready
});
