// src/__tests__/components/DataTable.spec.ts
import { mount, createLocalVue } from '@vue/test-utils';
import Vue from 'vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);

describe('DataTable', () => {
    let vuetify: any;

    beforeEach(() => {
        vuetify = new Vuetify();
    });

    const mountFunction = (options: any) => {
        return mount(options, {
            vuetify,
            attachTo: document.body
        });
    };

    const mockHeaders = [
        { text: 'VIN', value: 'vin', visible: true },
        { text: 'Статус', value: 'status.name', visible: true }
    ];

    const mockItems = [
        {
            vin: 'ABC123',
            status: { name: 'Активен' }
        }
    ];

    test('отображает корректное количество колонок', async () => {
        const wrapper = mountFunction({
            template: `
        <v-data-table
          :headers="headers"
          :items="items"
        />
      `,
            data() {
                return {
                    headers: mockHeaders,
                    items: mockItems
                }
            }
        });

        // Ждем следующего тика для обработки Vue
        await wrapper.vm.$nextTick();

        const headers = wrapper.findAll('.v-data-table__wrapper th');
        expect(headers.length).toBe(mockHeaders.length);
    });
});