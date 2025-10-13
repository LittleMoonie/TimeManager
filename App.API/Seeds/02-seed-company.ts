import { DataSource } from 'typeorm';
import { Company } from '../Entities/Companies/Company';

export async function seedCompany(ds: DataSource) {
  const repo = ds.getRepository(Company);

  // Feel free to change names/domains
  const payload = {
    name: 'Demo Company',
    domain: 'demo.example.com', // optional column if you have it
  } as Partial<Company>;

  // If you enforce unique by name or some external key, adjust the where
  let company = await repo.findOne({ where: { name: payload.name } });
  if (!company) {
    company = repo.create(payload);
    await repo.save(company);
    console.log('🏢 Created Company:', company.name, company.id);
  } else {
    console.log('🏢 Company exists:', company.name, company.id);
  }

  return { company };
}
