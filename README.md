# #CODETOIMPACT Submission Repository

## Overview
This repository contains the solution for the hackathon project. 
All codes must be checked into this repository. 
Additionally, Challenge 1 solution must be deployed into the provided EC2 instance.
---

## Deployment Instructions
1. **Deploy the REST API solution** on the EC2 instance following your usual deployment steps.
2. **Configure port** to allow incoming traffic for the REST API on port 8000.
3. **SSH:** Please use Host DNS (SSH) for accessing the EC2 instance through SSH (Port 22)
4. **HTTP:** Please use Host DNS (HTTP) for accessing the exposed REST API (Port 8000)

---

## EC2 Instance Details

| Parameter       | Value                                                              |
|-----------------|--------------------------------------------------------------------|
| Host DNS (SSH)  | `2025-app-8-ssh-e045ac330bc54513.elb.ap-southeast-1.amazonaws.com` |
| Host DNS (HTTP) | `2025-app-8-http-2027981724.ap-southeast-1.elb.amazonaws.com`      |
| Username        | `ec2-user`                                                         |
| OS              | `Amazon Linux`                                                     |
| Allowed Ports   | `22, 8000`                                                         |

**Private Key (.pem file):**  
```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAn6EiVEnRKodClOGinIcbehvaSJU1EOHpn0c4lMjqxl39P4BN
bXO1th6eeNWuG9zLoFV3jvc2EgFXBPFH4vOJd2L9Bd6nqPmb9qz64kltcnAz3K6e
47cmjxI1iiIY+Yx7fvFdPFNFwjZPCmDW7tpEJZ5MokP6/BKJoPleHf27uoa5t9mV
5Aqj2O5NTnoUCaDo9m+LOfWt1t4O5c6exiezm39Q79qTs4WHh2OawqfRUWeu2Bl1
4Gr2PVd+EdFyXUBG3qbPeu0IgCDemsvLuKkr2a2Y88GA9JrZ99ZLYhWstPTbPHe6
SaYEHAPy6naD1bU5LGdldFmE8ObP/+VMPiyRowIDAQABAoIBAHQmRNpb08xEGxhF
jZKjZETXW18Q4knkd58jrXHlN58a6Jh5/Ny1IvTfFqQJpuQzJh8F0Ta/fiJfwzef
cJUca1vpNP4+YnQ7G1bDytE4aGCqb7IVhRtgOrhDoZ1e7hk2NO3LJfItDUchSSXe
DMZDHu7YXh57pHYh7u6oQ+lCpIQ1ORE+blzV0QtYwP+HCR0sQZGYIsVWorvkqV9m
4hAj9eVZImG06bpILw87Q5PF70mga/+GLoQSH+TY1zUmFhyYHGiI3h5p6sAIKdCw
OO/d+fE+Ug6Q6d8bMzIcgTJh3+Wiz9QkW3MaKSr9i1GgTQDqHtLza3bklPMif6tq
TfPyv7ECgYEA08BUt2qb+iaD/CLl5U1O4+Woq0InrT1hGCutBhhAvQ4QvXOoia2A
24h+QSSdOSARQYktB1qJCu7MUcnKoUUIuWH0SeD0uzoI1nDKJVQgxLA5F6TL8hN9
uP+d/3JtrLv4IhatKlvFihiEaTpDGCAEzb6mXq3HLkIXz8/btJluI90CgYEAwPyJ
LTkFR+NjLNiEmZETVXFbXUJ+aMbjE19va5xsIfnpfl8y6XD60aR1DGcXsBWuT4DA
qDuD6DLZZtnpqMjb/mSWDgoFIw57iBb4PxesVGXkR7B/r6B2DNozfX4xkgIDXIwl
KZPDnUc5BuVRgI3kYz3P+xIdwhXrBQ1LAUWW838CgYAnB9yVsmDtywuo/gXCLm3M
NBjS+G630AiFnAdYiD/mmSEcyqTWO9T0okQjXcxdKzwDCHX0VQvNqBahPMDM2Ryy
jwuoUn7Jw/i9Di00lD02BAWCBi5RgKY742IMI9tza3JhViy1EhVnTv2ZJ9QWLlC0
W9/us7lzHVumQnoM3/sdQQKBgHOe2RCe+Or48JINpmPa5xppr7NQAywC/Ei/BKIU
NTSl5Z4wqu/xIFQ5k2a63RZB5wz6tnIUNhMHY/ia1cKplCP1X3FJz4oRQzFlkZU7
OaPW582LkPRHznIkyHSHBmvTiPAJhrpCLRAte50GBq5eVFag0do6IFoHh6afMDCy
4J1BAoGBAIF8rBDQNPEoAJyobVp+QiFMmP+Gx64M+TfaPNKvxOjSpRrbDTT1FBUj
eNSJkyY7ENGU0H4tNjIaxOGBwseMOnWPW8jkBRRBOY2MYA7vukuOH9VZXfAWkn3t
OuNPSA7HuvDgjlcC8dla2f5D3QNZiuqvq60pbR/yzNpZqPaX6RsO
-----END RSA PRIVATE KEY-----
```

---

## Database Configuration
The data used for computation is hosted on a PostgreSQL database. Please enter your database credentials below:

| Parameter | Value                                      |
|-----------|--------------------------------------------|
| Host      | `aws-0-ap-southeast-1.pooler.supabase.com` |
| Port      | `5432`                                     |
| Database  | `postgres`                                 |
| Username  | `team8dbuser.jdcgkhwtrsdhyysagkwb`         |
| Password  | `lox8753ef8mr43ca`                         |

---

## OpenAPI Middleware 

| Parameter  | Value                           |
|------------|---------------------------------|
| Project ID | `proj_NCapaoVo6wPuvbEbiRbnV2nY` |

---

## Swagger Documentation
The Swagger file defining this API can be found at:

```plaintext
paths:
  /portfolio-price:
    get:
      summary: Get portfolio price on a specific date
      parameters:
        - name: portfolioId
          in: query
          required: true
          schema: { type: string }
        - name: date
          in: query
          required: true
          schema: { type: string, format: date }
      responses:
        '200':
          description: Portfolio price
          content:
            application/json:
              schema:
                type: object
                properties:
                  portfolioId: { type: string }
                  date: { type: string, format: date }
                  price: { type: number }

  /daily-return:
    get:
      summary: Get daily return for a portfolio
      parameters:
        - name: portfolioId
          in: query
          required: true
          schema: { type: string }
        - name: date
          in: query
          required: true
          schema: { type: string, format: date }
      responses:
        '200':
          description: Daily return
          content:
            application/json:
              schema:
                type: object
                properties:
                  portfolioId: { type: string }
                  date: { type: string, format: date }
                  return: { type: number }

  /cumulative-return:
    get:
      summary: Get cumulative portfolio price from a base date
      parameters:
        - name: portfolioId
          in: query
          required: true
          schema: { type: string }
        - name: startDate
          in: query
          required: true
          schema: { type: string, format: date }
        - name: endDate
          in: query
          required: true
          schema: { type: string, format: date }
      responses:
        '200':
          description: Cumulative price series
          content:
            application/json:
              schema:
                type: object
                properties:
                  portfolioId: { type: string }
                  cumulativeReturn: { type: number }

  /daily-volatility:
    get:
      summary: Compute volatility over a date range
      parameters:
        - name: portfolioId
          in: query
          required: true
          schema: { type: string }
        - name: startDate
          in: query
          required: true
          schema: { type: string, format: date }
        - name: endDate
          in: query
          required: true
          schema: { type: string, format: date }
      responses:
        '200':
          description: Volatility value
          content:
            application/json:
              schema:
                type: object
                properties:
                  portfolioId: { type: string }
                  volatility: { type: number }

  /correlation:
    get:
      summary: Compute correlation between two portfolios
      parameters:
        - name: portfolioId1
          in: query
          required: true
          schema: { type: string }
        - name: portfolioId2
          in: query
          required: true
          schema: { type: string }
        - name: startDate
          in: query
          required: true
          schema: { type: string, format: date }
        - name: endDate
          in: query
          required: true
          schema: { type: string, format: date }
      responses:
        '200':
          description: Correlation result
          content:
            application/json:
              schema:
                type: object
                properties:
                  portfolioId1: { type: string }
                  portfolioId2: { type: string }
                  correlation: { type: number }

  /tracking-error:
    get:
      summary: Compute tracking error against benchmark
      parameters:
        - name: portfolioId
          in: query
          required: true
          schema: { type: string }
        - name: benchmarkId
          in: query
          required: true
          schema: { type: string }
        - name: startDate
          in: query
          required: true
          schema: { type: string, format: date }
        - name: endDate
          in: query
          required: true
          schema: { type: string, format: date }
      responses:
        '200':
          description: Tracking error result
          content:
            application/json:
              schema:
                type: object
                properties:
                  portfolioId: { type: string }
                  benchmarkId: { type: string }
                  trackingError: { type: number }
