import { test, expect } from '@playwright/test';

test('Validating the shopping cart functionality', async ({ page }) => {
  await page.goto('https://ksiegarnia.bn.org.pl');
  await page.getByRole('link', { name: 'Bibliografia', exact: true }).click();
  await page.locator('div').filter({ hasText: /^DO KOSZYKA$/ }).first().click();
  await expect(page.getByText('Masz obecnie 1 sztukę tej pozycji w koszyku.')).toBeVisible();
  await page.getByText('kontynuuj zakupy').click();
  await page.locator('div').filter({ hasText: /^DO KOSZYKA$/ }).first().click();
  await expect(page.getByText('Masz obecnie 2 sztuki tej pozycji w koszyku.')).toBeVisible();
  await page.getByText('kontynuuj zakupy').click();
  await page.locator('div').filter({ hasText: /^DO KOSZYKA$/ }).nth(1).click();
  await expect(page.getByText('Masz obecnie 1 sztukę tej pozycji w koszyku.')).toBeVisible();
  await page.getByText('kontynuuj zakupy').click();
  await page.locator('div').filter({ hasText: /^DO KOSZYKA$/ }).nth(2).click();
  await expect(page.getByText('Masz obecnie 1 sztukę tej pozycji w koszyku.')).toBeVisible();
  await page.getByText('kontynuuj zakupy').click();
  await page.locator('div').filter({ hasText: /^DO KOSZYKA$/ }).nth(3).click();
  await expect(page.getByText('Masz obecnie 1 sztukę tej pozycji w koszyku.')).toBeVisible();
  await page.getByText('kontynuuj zakupy').click();
  await page.locator('div').filter({ hasText: /^DO KOSZYKA$/ }).nth(4).click();
  await page.getByText('kontynuuj zakupy').click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: 'koszyk' }).click();
  
  // Calculate cart total before changes based on the table
  const cartTotalBefore = await page.evaluate(() => {
    const rows = document.querySelectorAll('table.tab tr');
    let total = 0;

    for (let i = 1; i < rows.length - 2; i++) {
      const priceText = rows[i]
        .querySelectorAll('td')[1]
        ?.querySelector('span.price2')
        ?.textContent;

      const input = rows[i].querySelector('input[type="text"]');

      if (priceText && input instanceof HTMLInputElement) {
        const price = parseFloat(
          priceText.replace(',', '.').replace(' zł', '')
        );

        const quantity = parseInt(input.value, 10);

        total += price * quantity;
        console.log(
          `Row ${i}: price = ${price}, quantity = ${quantity}, subtotal = ${
            price * quantity
          }`
        );
      }
    }

    return total;
  });
  
  // Get order total from the table
  const orderTotalLocator = page
    .locator('td[align="RIGHT"][valign="TOP"]:has-text("SUMA ZAMÓWIENIA")')
    .locator('xpath=following-sibling::td');

  await expect(orderTotalLocator).toBeVisible();
  const orderTotalText = await orderTotalLocator.innerText();
  const orderTotal = parseFloat(
    orderTotalText.replace(',', '.').replace(' zł', '')
  );
  // Compare calculated total with order total
  expect(cartTotalBefore).toBeCloseTo(orderTotal, 2);
  console.log(`Calculated cart total: ${cartTotalBefore}, Displayed order total: ${orderTotal}`);
  
  const firstInput = page.locator(`//table[@class='tab']//tr[2]//input`);
  await expect(firstInput).toHaveValue('2');
  await firstInput.click();
  await firstInput.fill('4');
  await page.locator('body').click();
  const thirdInput = page.locator(`//table[@class='tab']//tr[3]//input`);
  await expect(thirdInput).toHaveValue('1');
  await thirdInput.click();
  await thirdInput.fill('2');
  await thirdInput.press('Enter');
  await page.locator('body').click();
  
  const expectedNewTotal = await page.evaluate(() => {
  const rows = document.querySelectorAll('table.tab tr');
  let total = 0;

  for (let i = 1; i < rows.length - 2; i++) {
    const priceText = rows[i]
      .querySelectorAll('td')[1]
      ?.querySelector('span.price2')
      ?.textContent;

    const quantityInput = rows[i].querySelector(
      'input[type="text"]'
    ) as HTMLInputElement | null;

    if (priceText && quantityInput) {
      const price = parseFloat(
        priceText.replace(',', '.').replace(' zł', '')
      );

      const quantity = parseInt(quantityInput.value);

      total += price * quantity;

      console.log(
        `Row ${i}: price = ${price}, quantity = ${quantity}, subtotal = ${
          price * quantity
        }`
      );
    }
  }

  return total;
  });
  
  await page.getByRole('link', { name: 'przelicz ponownie' }).click();
  await page.waitForTimeout(3000);
  
  // Check if new order total matches expected
  const newOrderTotalLocator = page
  .locator('td[align="RIGHT"][valign="TOP"]:has-text("SUMA ZAMÓWIENIA")')
  .locator('xpath=following-sibling::td');

  await expect(newOrderTotalLocator).toBeVisible();
  const newOrderTotalText = await newOrderTotalLocator.innerText();
  const newOrderTotal = parseFloat(newOrderTotalText.replace(',', '.').replace(' zł', ''));
  expect(newOrderTotal).toBeCloseTo(expectedNewTotal, 2);
  console.log(`Expected new total: ${expectedNewTotal}, Displayed new order total: ${newOrderTotal}`);

// Check if all fields are filled correctly
  await page.getByRole('radio').nth(1).check();
  await page.getByRole('link', { name: 'DO KASY' }).click();
  await page.getByRole('link', { name: 'Klient jednorazowy' }).click();
  await page.locator('input[name="imie"]').click();
  await page.locator('input[name="imie"]').click();
  await page.locator('input[name="imie"]').fill('Łukasz');
  expect (page.locator('input[name="imie"]')).toHaveValue('Łukasz');
  await page.locator('input[name="nazwisko"]').click();
  await page.locator('input[name="nazwisko"]').fill('Ostrowski');
  expect (page.locator('input[name="nazwisko"]')).toHaveValue('Ostrowski');
  await page.locator('input[name="mail"]').click();
  await page.locator('input[name="mail"]').click();
  await page.locator('input[name="mail"]').fill('lukaszostrowski1984@gmail.com');
  expect (page.locator('input[name="mail"]')).toHaveValue('lukaszostrowski1984@gmail.com');
  await page.locator('textarea[name="uwagi"]').click();
  await page.locator('textarea[name="uwagi"]').fill('This is Automation test ');
  expect (page.locator('textarea[name="uwagi"]')).toHaveValue('This is Automation test ');
  await page.locator('input[name="akceptuje"]').check();
  expect (page.locator('input[name="akceptuje"]')).toBeChecked();
  await page.locator('input[name="check2"]').check();
  expect (page.locator('input[name="check2"]')).toBeChecked();
  await page.locator('input[name="zaloz"]').check();
  expect (page.locator('input[name="zaloz"]')).toBeChecked();
  await page.locator('input[name="newsl"]').check();
  expect (page.locator('input[name="newsl"]')).toBeChecked();
  await page.getByRole('link', { name: 'REZYGNACJA' }).click();
});