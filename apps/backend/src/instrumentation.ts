import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';

// Define the resource (service name, version, etc.)
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'edtech-backend',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
});

// Create the SDK instance
const sdk = new NodeSDK({
  resource,
  // Use ConsoleSpanExporter for simplicity in this setup.
  // In production, this would point to Jaeger or Zipkin.
  traceExporter: new ConsoleSpanExporter(),
  instrumentations: [
    getNodeAutoInstrumentations({
        // Disable modules we don't need or that conflict
        '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

// Start the SDK
sdk.start();

// Gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

console.log('OpenTelemetry initialized');
