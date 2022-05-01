import { Config } from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'
import { dbEnv, kafkaEnv } from '../utils/env'
import { githubImage } from '../utils/image'

export const deployment = (config: Config, provider: k8s.Provider) =>
  new k8s.apps.v1.Deployment(
    'runner-deployment',
    {
      metadata: {
        labels: {
          app: 'runner',
          version: config.get('version') || 'latest',
          sha: config.get('sha') || 'HEAD',
        },
        name: 'runner',
        namespace: 'rnd',
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'runner-pod',
          },
        },
        strategy: {},
        template: {
          metadata: {
            labels: {
              app: 'runner-pod',
            },
          },
          spec: {
            restartPolicy: 'Always',
            containers: [
              {
                name: 'runner',
                image: githubImage(config, 'runner'),
                imagePullPolicy: 'Always',
                ports: [
                  {
                    containerPort: 8080,
                  },
                ],
                env: [...dbEnv(config), ...kafkaEnv(config)],
              },
            ],
          },
        },
      },
    },
    { provider }
  )
