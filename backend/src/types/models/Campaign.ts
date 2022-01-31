import { objectType } from 'nexus';

export const Campaign = objectType({
  name: 'Campaign',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.logo();
    t.model.total_donation();
    t.model.active();
  }
});
