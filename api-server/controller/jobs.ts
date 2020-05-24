import { save } from '../deps.ts';
import { Handler } from '../context.ts';
import { RESPONSE } from '../constants.ts';
import { PASSWORD } from '../config.ts';

// 获取jobs列表，可以通过指定参数count，控制获取数量，count不能超过100
export const list: Handler = async ({ req, url, db }) => {
  let count = 10;

  // 从url中获取count参数，并检验count的值是否符合要求（小于100）
  if (url.searchParams.has('count')) {
    const requestCount = parseInt(url.searchParams.get('count') as string, 10);
    if (requestCount > 100) {
      req.respond(RESPONSE.badRequest);
      return;
    } else {
      count = requestCount;
    }
  }

  // 从数据库中获取job列表，这里需要对jobs和companies两个表进行JOIN
  // 从而能获取job对应的company名称
  const result = [];
  const rows = db.query(
    `SELECT job_title, name
      FROM jobs JOIN companies ON company_id = companies.id
      ORDER BY jobs.id DESC
      LIMIT ?
    `,
    [count]
  );
  for (const row of rows) {
    const [jobTitle, companyName] = row as string[];
    result.push({
      company_name: companyName,
      job_title: jobTitle,
    });
  }

  req.respond({
    body: JSON.stringify(result),
    status: 200,
  });
};

// 往jobs列表中添加新的jobs，由于需要写入数据库，这里需要pw参数来代表授权
export const add: Handler = async ({ req, url, db }) => {
  let passwordValid = false;

  // 从url中获取pw参数，并检查是否和config中的PASSWORD一致
  // 只有获得授权（密码正确）的情况下才能对数据库进行写入
  if (url.searchParams.has('pw')) {
    const requestPassword = url.searchParams.get('pw') as string;
    if (requestPassword === PASSWORD) {
      passwordValid = true;
    }
  }

  if (!passwordValid) {
    console.log('password not valid');
    req.respond(RESPONSE.notAllowed);
    return;
  }

  // 从url上获取其他参数
  const applyUrl = url.searchParams.get('apply_url');
  const jobTitle = url.searchParams.get('job_title');
  const jobDetails = url.searchParams.get('job_details');
  const companyName = url.searchParams.get('company_name');
  const payRange = url.searchParams.get('pay_range');

  // url参数中传入的company的名称，首选需要兑换为company的id
  // 对于兑换失败，意味这该名称的company不存在
  const [company] = db.query(
    `SELECT id
      FROM companies
      WHERE name = ?
    `,
    [companyName]
  );
  const companyId = company && company[0];

  if (!companyId) {
    req.respond({
      body: 'Company name not specified.',
      status: 400,
    });
    return;
  }

  db.query(
    `INSERT INTO jobs (
      company_id,
      apply_url,
      job_title,
      job_details,
      pay_range,
      active,
      created_at,
      updated_at
    )
    VALUES (
      ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )`,
    [
      companyId,
      applyUrl,
      jobTitle,
      jobDetails,
      payRange,
    ]
  );

  await save(db);

  req.respond({
    status: 200,
  });
};

