import * as Sentry from '@sentry/node';
import { ApolloError, AuthenticationError } from 'apollo-server-express';
import { GraphQLRequestContext } from 'apollo-server-plugin-base';

const { SENTRY_TRACE_SAMPLE_RATE = '1.0', SENTRY_DSN_URL = '', ENV } = process.env;

const isEnabled = () => ['testing', 'staging', 'production'].includes(ENV);

if (isEnabled()) {
  Sentry.init({
    dsn: SENTRY_DSN_URL,
    tracesSampleRate: parseFloat(SENTRY_TRACE_SAMPLE_RATE),
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true })
    ],
    environment: ENV
  });
}

export function captureApollo(ctx: GraphQLRequestContext): void {
  if (!isEnabled()) return;
  if (!ctx.operation) return;
  for (const err of ctx.errors) {
    // Only report internal server errors,
    // all errors extending ApolloError should be user-facing
    if (err instanceof ApolloError) {
      continue;
    }
    // All authentication errors are not system errors
    if (err instanceof AuthenticationError) {
      continue;
    }
    // Add scoped report details and send to Sentry
    Sentry.withScope((scope) => {
      // Annotate whether failing operation was query/mutation/subscription
      scope.setTag('kind', ctx.operation.operation);
      scope.setExtra('query', ctx.request.query);
      scope.setExtra('variables', ctx.request.variables);
      if (err.path) {
        // We can also add the path as breadcrumb
        scope.addBreadcrumb({
          category: 'query-path',
          message: err.path.join(' > '),
          level: Sentry.Severity.Debug
        });
      }
      const transactionId = ctx.request.http.headers.get('x-transaction-id');
      if (transactionId) {
        scope.setTransaction(transactionId);
      }
      Sentry.captureException(err);
    });
  }
}
